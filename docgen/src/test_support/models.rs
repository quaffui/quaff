use std::path::PathBuf;

/// Temporary fixture directory removed automatically when its owner is dropped.
pub struct Fixture(pub PathBuf);
