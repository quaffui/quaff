use std::{collections::BTreeMap, path::PathBuf};

/// Tracks transitive source dependencies and reuses scans within one generation run.
#[derive(Default)]
pub struct SourceGraph {
    pub(super) project_root: PathBuf,
    pub(super) dependencies: BTreeMap<PathBuf, Vec<PathBuf>>,
}
