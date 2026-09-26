use std::{
    io::BufRead,
    path::{Path, PathBuf},
};

use serde::de::DeserializeOwned;

use crate::Result;

use super::models::Request;

/// Formats sources with the host's project-aware Prettier configuration.
pub(crate) fn format(sources: Vec<String>, can_fallback: bool) -> Result<Vec<String>> {
    Request::Format {
        sources,
        can_fallback,
    }
    .send()
}

/// Resolves an import using the host's Vite resolver.
pub(crate) fn resolve(source: &str, importer: &Path) -> Result<Option<PathBuf>> {
    Request::Resolve { source, importer }.send()
}

/// Stops the host timeout before output replacement starts.
pub(crate) fn prepare_commit() -> Result<()> {
    Request::Commit.send()
}

/// Reads one JSON message, failing if the host disconnects before replying.
pub(crate) fn read_message<T: DeserializeOwned>() -> Result<T> {
    let mut message = String::new();

    if std::io::stdin().lock().read_line(&mut message)? == 0 {
        return Err("Docgen host disconnected before responding".into());
    }

    Ok(serde_json::from_str(&message)?)
}
