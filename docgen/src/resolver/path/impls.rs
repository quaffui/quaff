use std::{
    fs::read_dir,
    path::{Path, PathBuf},
};

use crate::Result;

use super::PathResolver;

impl<'a> PathResolver<'a> {
    /// Tries to resolve a path that:
    /// - is relative to the currently processed file (e.g. `./date` or `../utils`)
    /// - is a Quaff path alias starting with `$` (e.g. `$utils`)
    ///
    /// Due to how TS allows export forwarding using `index.ts` files,
    /// you can import stuff from directories directly.
    ///
    /// To allow finding imports even from directories, the function will give access to
    /// all files recursively to all files within an exisiting directory via a callback.
    /// When you found your file and are done with it, return `Ok(true)` in the callback
    /// to stop the recursion.
    pub fn resolve<T: FnMut(PathBuf) -> Result<bool>>(
        &self,
        path_str: &str,
        mut callback: T,
    ) -> Result<()> {
        let strip = |path: &Path, prefix: &str| -> Result<PathBuf> {
            let res = path.strip_prefix(prefix).map(|p| p.to_path_buf())?;
            Ok(res)
        };
        let get_parent = |p: &Path| -> Result<PathBuf> {
            p.parent()
                .ok_or(
                    format!(
                        "Could not find the processed file's parent directory: {}",
                        self.0.display()
                    )
                    .into(),
                )
                .map(|p| p.to_path_buf())
        };

        let mut path_to_resolve = PathBuf::from(path_str);
        let mut base_path = get_parent(self.0)?;

        if path_str.starts_with("./") {
            path_to_resolve = strip(&path_to_resolve, "./")?;
        } else if path_str.starts_with("../") {
            let mut count = path_str.matches("../").count();
            while count > 0 {
                base_path = get_parent(&base_path)?;
                path_to_resolve = strip(&path_to_resolve, "../")?;
                count -= 1;
            }
        } else if path_str.starts_with("$") {
            path_to_resolve = PathBuf::from(&path_str[1..]);
            let lib_path = self.0.ancestors().find(|path| path.ends_with("lib"));

            base_path = if let Some(lib) = lib_path {
                lib.to_path_buf()
            } else {
                panic!("Could not find lib from path: {:#?}", path_str)
            };
        } else {
            panic!(
                "Trying to resolve a path to an external library: {}",
                path_str
            )
        }

        let mut resolved = base_path.join(&path_to_resolve);

        if !resolved.exists() {
            if !resolved.with_extension("ts").exists() {
                return Err(format!("Could not resolve path: {:#?}", resolved).into());
            }

            resolved.set_extension("ts");
        }

        if resolved.is_file() {
            callback(resolved)?;
        } else {
            recursive_walk(resolved, &mut callback)?;
        }

        Ok(())
    }
}

/// Walks through a directory tree recursively, calling a callback for each file.
/// If the callback returns `true`, the walk will stop.
fn recursive_walk<T: FnMut(PathBuf) -> Result<bool>>(
    path: PathBuf,
    callback: &mut T,
) -> Result<()> {
    let dirents = read_dir(path)?;

    for dirent in dirents {
        let dirent = dirent?;
        let path = dirent.path();

        if path.is_file() {
            if callback(path)? {
                break;
            }
        } else {
            recursive_walk(path, callback)?;
        }
    }

    Ok(())
}
