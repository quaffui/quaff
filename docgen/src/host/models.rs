use std::path::Path;

use serde::Serialize;

/// Requests handled by the TypeScript resolver and formatter host.
#[derive(Serialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub(super) enum Request<'a> {
    Commit,
    Format {
        sources: Vec<String>,
        can_fallback: bool,
    },
    Resolve {
        source: &'a str,
        importer: &'a Path,
    },
}
