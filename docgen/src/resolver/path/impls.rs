use std::path::{Path, PathBuf};

use crate::Result;

use super::PathResolver;

impl PathResolver<'_> {
    /// Resolves a local TypeScript module, including Quaff aliases and directory indexes.
    pub fn resolve(&self, path_str: &str) -> Result<PathBuf> {
        if !path_str.starts_with('$') && !path_str.starts_with("./") && !path_str.starts_with("../")
        {
            return Err(format!("Cannot resolve external module: {path_str}").into());
        }

        self.resolve_local_file(path_str, None)?.ok_or_else(|| {
            format!(
                "Could not resolve path: {path_str} from {}",
                self.0.display()
            )
            .into()
        })
    }

    /// Finds an existing TypeScript source using aliases, extension fallbacks, and index files.
    pub(crate) fn resolve_local_file(
        &self,
        path_str: &str,
        lib_root: Option<&Path>,
    ) -> Result<Option<PathBuf>> {
        let path = if let Some(alias) = path_str.strip_prefix('$') {
            let lib = lib_root
                .or_else(|| self.0.ancestors().find(|path| path.ends_with("lib")))
                .ok_or_else(|| format!("Could not find lib from {}", self.0.display()))?;
            let relative = alias.strip_prefix("lib/").unwrap_or(alias);

            if alias == "lib" {
                lib.to_path_buf()
            } else {
                lib.join(relative)
            }
        } else if Path::new(path_str).is_absolute() {
            PathBuf::from(path_str)
        } else if path_str.starts_with('.') {
            self.0
                .parent()
                .ok_or_else(|| format!("Could not find parent of {}", self.0.display()))?
                .join(path_str)
        } else {
            return Ok(None);
        };
        let mut candidates = vec![
            path.clone(),
            PathBuf::from(format!("{}.ts", path.display())),
        ];

        if path.extension().is_some_and(|extension| extension == "js") {
            candidates.push(path.with_extension("ts"));
        }

        candidates.push(path.join("index.ts"));
        candidates
            .into_iter()
            .find(|candidate| candidate.is_file())
            .map(|resolved| resolved.canonicalize().map_err(Into::into))
            .transpose()
    }
}
