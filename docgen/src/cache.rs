use std::{
    collections::BTreeSet,
    fs,
    path::{Path, PathBuf},
};

use sha2::{Digest, Sha256};

use crate::Result;

pub const GENERATED_HEADER: &str = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";

pub fn hash_generator(project_root: &Path) -> Result<String> {
    let generator = Path::new(env!("CARGO_MANIFEST_DIR"));
    let mut files = [".prettierrc", "bun.lock", "package.json"]
        .map(|file| project_root.join(file))
        .into_iter()
        .collect::<BTreeSet<_>>();
    files.extend([generator.join("Cargo.toml"), generator.join("Cargo.lock")]);
    collect_generator_files(generator, &mut files)?;
    hash_files(&files)
}

pub fn hash_sources(files: &BTreeSet<PathBuf>, generator_hash: &str) -> Result<String> {
    Ok(hash(
        format!("{generator_hash}{}", hash_files(files)?).as_bytes(),
    ))
}

fn hash_files(files: &BTreeSet<PathBuf>) -> Result<String> {
    let entries = files
        .iter()
        .map(|file| Ok((file, hash(&fs::read(file)?))))
        .collect::<Result<Vec<_>>>()?;
    Ok(hash(&serde_json::to_vec(&entries)?))
}

fn collect_generator_files(directory: &Path, files: &mut BTreeSet<PathBuf>) -> Result<()> {
    for entry in fs::read_dir(directory)? {
        let entry = entry?;
        let path = entry.path();
        let file_type = entry.file_type()?;

        if file_type.is_dir() && entry.file_name() != "target" {
            collect_generator_files(&path, files)?;
        } else if file_type.is_file()
            && matches!(
                path.extension().and_then(|value| value.to_str()),
                Some("ts" | "rs")
            )
            && !path.to_string_lossy().ends_with(".test.ts")
        {
            files.insert(path);
        }
    }

    Ok(())
}

pub fn hash(bytes: &[u8]) -> String {
    Sha256::digest(bytes)[..16]
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

pub fn read_output(path: &Path) -> Result<Option<String>> {
    match fs::read_to_string(path) {
        Ok(contents) => Ok(Some(contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.into()),
    }
}
