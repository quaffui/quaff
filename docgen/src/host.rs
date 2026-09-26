use std::{
    io::{BufRead, Write},
    path::{Path, PathBuf},
};

use serde::{Serialize, de::DeserializeOwned};

use crate::Result;

#[derive(Serialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
enum Request<'a> {
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

pub fn format(sources: Vec<String>, can_fallback: bool) -> Result<Vec<String>> {
    request_host(Request::Format {
        sources,
        can_fallback,
    })
}

pub fn resolve(source: &str, importer: &Path) -> Result<Option<PathBuf>> {
    request_host(Request::Resolve { source, importer })
}

pub fn prepare_commit() -> Result<()> {
    request_host(Request::Commit)
}

fn request_host<T: DeserializeOwned>(request: Request<'_>) -> Result<T> {
    let mut stdout = std::io::stdout().lock();
    serde_json::to_writer(&mut stdout, &request)?;
    writeln!(stdout)?;
    stdout.flush()?;
    read_message()
}

pub fn read_message<T: DeserializeOwned>() -> Result<T> {
    let mut message = String::new();

    if std::io::stdin().lock().read_line(&mut message)? == 0 {
        return Err("Docgen host disconnected before responding".into());
    }

    Ok(serde_json::from_str(&message)?)
}
