use std::{
    collections::BTreeSet,
    fs,
    path::{Path, PathBuf},
};

use crate::{Result, parser::extract_svelte_scripts, resolver::PathResolver};

use super::{
    funcs::{is_source_file, scan_imports, scan_interfaces},
    models::SourceGraph,
};

impl SourceGraph {
    /// Starts an empty dependency graph for one project.
    pub fn new(project_root: &Path) -> Self {
        Self {
            project_root: project_root.to_path_buf(),
            ..Self::default()
        }
    }

    /// Collects transitive sources using Quaff local aliases.
    pub fn collect_source_files(&mut self, roots: &[PathBuf]) -> Result<BTreeSet<PathBuf>> {
        let lib = self.project_root.join("src/lib");
        self.collect_source_files_with(roots, &mut |source, importer| {
            PathResolver(importer).resolve_local_file(source, Some(&lib))
        })
    }

    /// Collects canonical source paths using the supplied module resolver.
    pub fn collect_source_files_with(
        &mut self,
        roots: &[PathBuf],
        resolve: &mut dyn FnMut(&str, &Path) -> Result<Option<PathBuf>>,
    ) -> Result<BTreeSet<PathBuf>> {
        let mut files = BTreeSet::new();
        let mut pending = roots.to_vec();

        while let Some(file) = pending.pop() {
            let file = file.canonicalize()?;

            if !is_source_file(&file) || !files.insert(file.clone()) {
                continue;
            }

            pending.extend(self.get_dependencies(&file, resolve)?.iter().cloned());
        }

        Ok(files)
    }

    /// Scans a file once and remembers its imports and inherited component sources.
    fn get_dependencies(
        &mut self,
        file: &Path,
        resolve: &mut dyn FnMut(&str, &Path) -> Result<Option<PathBuf>>,
    ) -> Result<&[PathBuf]> {
        if !self.dependencies.contains_key(file) {
            let source = fs::read_to_string(file)?;
            let scripts = if file
                .extension()
                .is_some_and(|extension| extension == "svelte")
            {
                extract_svelte_scripts(&source)
                    .map(|(_, script)| script)
                    .collect()
            } else {
                vec![source.as_str()]
            };
            let mut dependencies = Vec::new();

            for script in scripts {
                for import in scan_imports(script) {
                    if (import.starts_with('.')
                        || import.starts_with('$')
                        || Path::new(&import).is_absolute())
                        && let Some(dependency) = resolve(&import, file)?
                        && is_source_file(&dependency)
                    {
                        dependencies.push(dependency.canonicalize()?);
                    }
                }
            }

            if matches!(
                file.extension().and_then(|extension| extension.to_str()),
                Some("ts" | "mts" | "cts")
            ) {
                for name in scan_interfaces(&source) {
                    let component = file.with_file_name(format!("{name}.svelte"));

                    if component.is_file() {
                        dependencies.push(component.canonicalize()?);
                    }
                }
            }

            self.dependencies.insert(file.to_path_buf(), dependencies);
        }

        Ok(&self.dependencies[file])
    }
}
