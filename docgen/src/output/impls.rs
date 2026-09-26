use std::fs;

use crate::test_support::Fixture;

use super::models::{OutputFile, TestProcess};

impl Fixture {
    /// Creates an output description without writing the destination.
    pub(super) fn create_output(&self, name: &str, contents: &str) -> OutputFile {
        OutputFile {
            destination: self.0.join(name),
            contents: contents.into(),
        }
    }

    /// Lists fixture entries deterministically for transaction assertions.
    pub(super) fn read_names(&self) -> Vec<String> {
        let mut names: Vec<_> = fs::read_dir(&self.0)
            .unwrap()
            .map(|entry| entry.unwrap().file_name().into_string().unwrap())
            .collect();
        names.sort();
        names
    }
}

impl Drop for TestProcess {
    /// Stops the child before removing its lock file.
    fn drop(&mut self) {
        let _ = self.0.kill();

        if self.0.wait().is_ok() {
            let _ = fs::remove_file(&self.1);
        }
    }
}
