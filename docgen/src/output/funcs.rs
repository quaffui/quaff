use std::{
    fs::{self, File, OpenOptions, TryLockError},
    io::{self, Write},
    path::{Path, PathBuf},
    thread,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use crate::{Result, cache::hash};

use super::{
    consts::{LOCK_POLL_INTERVAL, LOCK_WAIT_TIMEOUT},
    models::{OutputFile, Target},
};

/// The returned file holds the lock until it is dropped or the process exits.
pub fn lock_outputs(scope: &Path) -> Result<File> {
    acquire_lock(scope, LOCK_WAIT_TIMEOUT)
}

/// Waits for the operating-system lock without replacing its shared inode.
pub(super) fn acquire_lock(scope: &Path, timeout: Duration) -> Result<File> {
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

/// Maps all aliases of an output directory to the same lock file.
pub(super) fn lock_path(scope: &Path) -> Result<PathBuf> {
    let scope = scope.canonicalize()?;
    let key = hash(scope.as_os_str().as_encoded_bytes());

    Ok(std::env::temp_dir().join(format!("quaff-docgen-props-{key}.lock")))
}

/// Installs generated outputs and removes owned orphans as one transaction.
pub fn replace_files(files: &[OutputFile], orphans: &[PathBuf]) -> Result<()> {
    replace_with_install(files, orphans, |source, destination| {
        fs::rename(source, destination)
    })
}

/// Runs an output transaction with an injectable installation step.
pub(super) fn replace_with_install(
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

/// Stages every new file before backing up and replacing the current outputs.
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

/// Allocates unique temporary and backup paths for every affected output.
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

/// Restores backups and removes staged files after an installation failure.
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

/// Records cleanup failures without preventing the remaining cleanup attempts.
fn record_failure(failures: &mut Vec<String>, path: &Path, result: io::Result<()>) {
    if let Err(error) = result {
        failures.push(format!("{}: {error}", path.display()));
    }
}

/// Removes a file while allowing an already absent path.
fn remove_if_present(path: &Path) -> io::Result<()> {
    match fs::remove_file(path) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        result => result,
    }
}
