use std::{
    fs, io,
    path::PathBuf,
    thread,
    time::{Duration, Instant},
};

use super::{
    funcs::{acquire_lock, lock_path, replace_with_install},
    lock_outputs,
    models::TestProcess,
    replace_files,
};
use crate::test_support::Fixture;
use std::process::{Command, Stdio};

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
