use std::{
    fs::{self, File, OpenOptions, TryLockError},
    io::{self, Write},
    path::{Path, PathBuf},
    thread,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use crate::{Result, cache::hash};

const LOCK_POLL_INTERVAL: Duration = Duration::from_millis(50);
const LOCK_WAIT_TIMEOUT: Duration = Duration::from_secs(10 * 60);

pub struct OutputFile {
    pub destination: PathBuf,
    pub contents: String,
}

struct Target {
    destination: PathBuf,
    temporary: PathBuf,
    backup: PathBuf,
    has_temporary: bool,
    has_backup: bool,
    is_installed: bool,
}

/// The returned file holds the lock until it is dropped or the process exits.
pub fn lock_outputs(scope: &Path) -> Result<File> {
    acquire_lock(scope, LOCK_WAIT_TIMEOUT)
}

fn acquire_lock(scope: &Path, timeout: Duration) -> Result<File> {
    let path = lock_path(scope)?;
    // Never unlink the lock file: waiters must continue locking the same inode.
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(&path)?;
    let started = Instant::now();

    loop {
        match file.try_lock() {
            Ok(()) => return Ok(file),
            Err(TryLockError::WouldBlock) if started.elapsed() < timeout => {
                thread::sleep(LOCK_POLL_INTERVAL.min(timeout.saturating_sub(started.elapsed())));
            }
            Err(TryLockError::WouldBlock) => {
                return Err(
                    format!("Timed out waiting for docgen lock {}.", path.display()).into(),
                );
            }
            Err(TryLockError::Error(error)) => return Err(error.into()),
        }
    }
}

fn lock_path(scope: &Path) -> Result<PathBuf> {
    let scope = scope.canonicalize()?;
    let key = hash(scope.as_os_str().as_encoded_bytes());

    Ok(std::env::temp_dir().join(format!("quaff-docgen-props-{key}.lock")))
}

pub fn replace_files(files: &[OutputFile], orphans: &[PathBuf]) -> Result<()> {
    replace_with_install(files, orphans, |source, destination| {
        fs::rename(source, destination)
    })
}

fn replace_with_install(
    files: &[OutputFile],
    orphans: &[PathBuf],
    install: impl FnMut(&Path, &Path) -> io::Result<()>,
) -> Result<()> {
    let mut targets = prepare_targets(files, orphans)?;

    if let Err(error) = install_files(files, &mut targets, install) {
        let failures = rollback(&targets);

        if failures.is_empty() {
            return Err(error.into());
        }

        return Err(format!(
            "Docgen failed: {error}; could not fully roll back generated files:\n{}",
            failures.join("\n")
        )
        .into());
    }

    let mut failures = Vec::new();

    for target in targets.iter().filter(|target| target.has_backup) {
        record_failure(
            &mut failures,
            &target.backup,
            remove_if_present(&target.backup),
        );
    }

    if !failures.is_empty() {
        return Err(format!(
            "Docgen committed generated files but could not remove every backup:\n{}",
            failures.join("\n")
        )
        .into());
    }

    Ok(())
}

fn install_files(
    files: &[OutputFile],
    targets: &mut [Target],
    mut install: impl FnMut(&Path, &Path) -> io::Result<()>,
) -> io::Result<()> {
    for (target, file) in targets.iter_mut().zip(files) {
        let mut temporary = File::create_new(&target.temporary)?;
        target.has_temporary = true;
        temporary.write_all(file.contents.as_bytes())?;
    }

    for target in targets.iter_mut() {
        match fs::symlink_metadata(&target.destination) {
            Ok(_) => {
                fs::rename(&target.destination, &target.backup)?;
                target.has_backup = true;
            }
            Err(error) if error.kind() == io::ErrorKind::NotFound => {}
            Err(error) => return Err(error),
        }
    }

    for target in targets.iter_mut().take(files.len()) {
        install(&target.temporary, &target.destination)?;
        target.has_temporary = false;
        target.is_installed = true;
    }

    Ok(())
}

fn prepare_targets(files: &[OutputFile], orphans: &[PathBuf]) -> Result<Vec<Target>> {
    // Component directories are unique; orphans belong to disjoint outputs.
    let nonce = format!(
        "{}-{}",
        std::process::id(),
        SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos()
    );

    Ok(files
        .iter()
        .map(|file| &file.destination)
        .chain(orphans)
        .map(|destination| {
            let mut temporary = destination.as_os_str().to_owned();
            temporary.push(format!(".{nonce}.tmp"));
            let mut backup = destination.as_os_str().to_owned();
            backup.push(format!(".{nonce}.bak"));

            Target {
                destination: destination.clone(),
                temporary: temporary.into(),
                backup: backup.into(),
                has_temporary: false,
                has_backup: false,
                is_installed: false,
            }
        })
        .collect())
}

fn rollback(targets: &[Target]) -> Vec<String> {
    let mut failures = Vec::new();

    for target in targets.iter().rev().filter(|target| target.is_installed) {
        record_failure(
            &mut failures,
            &target.destination,
            remove_if_present(&target.destination),
        );
    }

    for target in targets.iter().rev().filter(|target| target.has_backup) {
        record_failure(
            &mut failures,
            &target.backup,
            fs::rename(&target.backup, &target.destination),
        );
    }

    for target in targets.iter().filter(|target| target.has_temporary) {
        record_failure(
            &mut failures,
            &target.temporary,
            remove_if_present(&target.temporary),
        );
    }

    failures
}

fn record_failure(failures: &mut Vec<String>, path: &Path, result: io::Result<()>) {
    if let Err(error) = result {
        failures.push(format!("{}: {error}", path.display()));
    }
}

fn remove_if_present(path: &Path) -> io::Result<()> {
    match fs::remove_file(path) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        result => result,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::Fixture;
    use std::process::{Child, Command, Stdio};

    impl Fixture {
        fn create_output(&self, name: &str, contents: &str) -> OutputFile {
            OutputFile {
                destination: self.0.join(name),
                contents: contents.into(),
            }
        }

        fn read_names(&self) -> Vec<String> {
            let mut names: Vec<_> = fs::read_dir(&self.0)
                .unwrap()
                .map(|entry| entry.unwrap().file_name().into_string().unwrap())
                .collect();
            names.sort();
            names
        }
    }

    #[test]
    fn replaces_outputs_and_removes_orphans() {
        let directory = Fixture::new();
        let first = directory.create_output("first.ts", "new first");
        let second = directory.create_output("second.ts", "new second");
        let orphan = directory.0.join("orphan.ts");
        directory.write("first.ts", "old first");
        directory.write("orphan.ts", "old orphan");

        replace_files(&[first, second], &[orphan, directory.0.join("missing.ts")]).unwrap();

        assert_eq!(directory.read("first.ts"), "new first");
        assert_eq!(directory.read("second.ts"), "new second");
        assert_eq!(directory.read_names(), ["first.ts", "second.ts"]);
    }

    #[test]
    fn leaves_outputs_unchanged_when_staging_fails() {
        let directory = Fixture::new();
        let first = directory.create_output("first.ts", "new first");
        let second = directory.create_output("missing/second.ts", "new second");
        let orphan = directory.0.join("orphan.ts");
        directory.write("first.ts", "old first");
        directory.write("orphan.ts", "old orphan");

        assert!(replace_files(&[first, second], std::slice::from_ref(&orphan)).is_err());
        assert_eq!(directory.read("first.ts"), "old first");
        assert_eq!(directory.read("orphan.ts"), "old orphan");
        assert_eq!(directory.read_names(), ["first.ts", "orphan.ts"]);
    }

    #[test]
    fn restores_replacements_and_orphans_after_partial_install() {
        let directory = Fixture::new();
        let files = [
            directory.create_output("first.ts", "new first"),
            directory.create_output("new.ts", "new file"),
            directory.create_output("last.ts", "new last"),
        ];
        let orphan = directory.0.join("orphan.ts");
        directory.write("first.ts", "old first");
        directory.write("last.ts", "old last");
        directory.write("orphan.ts", "old orphan");
        let mut installed = 0;
        let result = replace_with_install(
            &files,
            std::slice::from_ref(&orphan),
            |source, destination| {
                installed += 1;

                if installed == 3 {
                    return Err(io::Error::other("installation failed"));
                }

                fs::rename(source, destination)
            },
        );

        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("installation failed")
        );
        assert_eq!(directory.read("first.ts"), "old first");
        assert_eq!(directory.read("last.ts"), "old last");
        assert_eq!(directory.read("orphan.ts"), "old orphan");
        assert_eq!(directory.read_names(), ["first.ts", "last.ts", "orphan.ts"]);
    }

    #[test]
    fn retains_backups_and_reports_rollback_failures() {
        let directory = Fixture::new();
        let files = [
            directory.create_output("first.ts", "new first"),
            directory.create_output("last.ts", "new last"),
        ];
        directory.write("first.ts", "old first");
        let result = replace_with_install(&files, &[], |source, destination| {
            if destination == files[1].destination {
                fs::remove_file(&files[0].destination)?;
                fs::create_dir(&files[0].destination)?;
                return Err(io::Error::other("installation failed"));
            }

            fs::rename(source, destination)
        });
        let error = result.unwrap_err().to_string();

        assert!(error.contains("installation failed"));
        assert!(error.contains("could not fully roll back"));
        let backups: Vec<_> = directory
            .read_names()
            .into_iter()
            .filter(|name| name.ends_with(".bak"))
            .collect();
        assert_eq!(backups.len(), 1);
        assert_eq!(directory.read(&backups[0]), "old first");
        assert!(
            !directory
                .read_names()
                .iter()
                .any(|name| name.ends_with(".tmp"))
        );
    }

    struct TestProcess(Child, PathBuf);

    impl Drop for TestProcess {
        fn drop(&mut self) {
            let _ = self.0.kill();

            if self.0.wait().is_ok() {
                let _ = fs::remove_file(&self.1);
            }
        }
    }

    #[test]
    fn serializes_processes_and_releases_lock_after_process_death() {
        let directory = Fixture::new();
        let ready = directory.0.join("ready");
        let lock_path = lock_path(&directory.0).unwrap();
        let mut child = TestProcess(
            Command::new(std::env::current_exe().unwrap())
                .args(["--exact", "output::tests::hold_lock_in_child", "--ignored"])
                .env("QUAFF_OUTPUT_TEST_SCOPE", &directory.0)
                .stdout(Stdio::null())
                .spawn()
                .unwrap(),
            lock_path,
        );
        let started = Instant::now();

        while !ready.exists() {
            assert!(
                started.elapsed() < Duration::from_secs(10),
                "child did not acquire lock"
            );
            assert!(
                child.0.try_wait().unwrap().is_none(),
                "child exited before acquiring lock"
            );
            thread::sleep(Duration::from_millis(10));
        }

        let result = acquire_lock(&directory.0.join("."), Duration::from_millis(80));
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("Timed out waiting")
        );
        child.0.kill().unwrap();
        child.0.wait().unwrap();
        let lock = acquire_lock(&directory.0, Duration::from_secs(1)).unwrap();
        drop(lock);
        lock_outputs(&directory.0).unwrap();
    }

    #[test]
    #[ignore = "spawned by the cross-process lock test"]
    fn hold_lock_in_child() {
        let scope = PathBuf::from(std::env::var_os("QUAFF_OUTPUT_TEST_SCOPE").unwrap());
        let _lock = lock_outputs(&scope).unwrap();
        fs::write(scope.join("ready"), "").unwrap();
        thread::sleep(Duration::from_secs(30));
    }
}
