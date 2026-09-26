use std::path::PathBuf;

/// A generated file ready for the output transaction.
pub struct OutputFile {
    pub destination: PathBuf,
    pub contents: String,
}

/// Tracks staged files and backups so failed installs can be rolled back.
pub(super) struct Target {
    pub(super) destination: PathBuf,
    pub(super) temporary: PathBuf,
    pub(super) backup: PathBuf,
    pub(super) has_temporary: bool,
    pub(super) has_backup: bool,
    pub(super) is_installed: bool,
}

/// Owns the child lock holder and cleans up its persistent lock file after exit.
#[cfg(test)]
pub(super) struct TestProcess(pub(super) std::process::Child, pub(super) PathBuf);
