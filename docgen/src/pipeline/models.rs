use std::{collections::BTreeSet, path::PathBuf};

/// Generation selection and host capabilities supplied by the TypeScript adapter.
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Options {
    pub(super) project_root: PathBuf,
    pub(super) targets: Vec<String>,
    pub(super) changed_files: BTreeSet<PathBuf>,
    pub(super) should_resolve_imports: bool,
}
