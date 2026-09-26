use std::{
    fs,
    path::{Path, PathBuf},
    sync::atomic::Ordering,
    time::{SystemTime, UNIX_EPOCH},
};

use super::{consts::NEXT_FIXTURE, models::Fixture};

impl Fixture {
    /// Creates a unique temporary directory and resolves platform path aliases.
    pub fn new() -> Self {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "quaff-docgen-test-{}-{nonce}-{}",
            std::process::id(),
            NEXT_FIXTURE.fetch_add(1, Ordering::Relaxed)
        ));
        fs::create_dir(&path).unwrap();
        Self(path.canonicalize().unwrap())
    }

    /// Writes a fixture file and creates any missing parent directories.
    pub fn write(&self, name: &str, contents: &str) -> PathBuf {
        let path = self.0.join(name);
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, contents).unwrap();
        path
    }

    /// Reads a file relative to the fixture directory.
    pub fn read(&self, name: impl AsRef<Path>) -> String {
        fs::read_to_string(self.0.join(name)).unwrap()
    }
}

impl Drop for Fixture {
    /// Removes the fixture directory and its files at the end of the test.
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}
