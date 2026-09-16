use std::path::PathBuf;

use crate::Result;

use super::PathResolver;

impl PathResolver<'_> {
    /// Resolves a local TypeScript module, including Quaff aliases and directory indexes.
    pub fn resolve<T: FnMut(PathBuf) -> Result<bool>>(
        &self,
        path_str: &str,
        mut callback: T,
    ) -> Result<()> {
        let path = if let Some(alias) = path_str.strip_prefix('$') {
            let lib = self
                .0
                .ancestors()
                .find(|path| path.ends_with("lib"))
                .ok_or_else(|| format!("Could not find lib from {}", self.0.display()))?;
            let relative = alias.strip_prefix("lib/").unwrap_or(alias);

            if alias == "lib" {
                lib.to_path_buf()
            } else {
                lib.join(relative)
            }
        } else if path_str.starts_with("./") || path_str.starts_with("../") {
            self.0
                .parent()
                .ok_or_else(|| format!("Could not find parent of {}", self.0.display()))?
                .join(path_str)
        } else {
            return Err(format!("Cannot resolve external module: {path_str}").into());
        };
        let mut candidates = vec![
            path.clone(),
            PathBuf::from(format!("{}.ts", path.display())),
        ];

        if path.extension().is_some_and(|extension| extension == "js") {
            candidates.push(path.with_extension("ts"));
        }

        candidates.push(path.join("index.ts"));
        let resolved = candidates
            .into_iter()
            .find(|candidate| candidate.is_file())
            .ok_or_else(|| format!("Could not resolve path: {}", path.display()))?;

        callback(resolved.canonicalize()?)?;
        Ok(())
    }
}
