use std::{
    collections::BTreeSet,
    fs,
    path::{Component, Path, PathBuf},
};

use crate::{
    Result,
    cache::{GENERATED_HEADER, hash_generator, hash_sources, read_output},
    component::{DocgenComponentInput, generate_component},
    dependencies::SourceGraph,
    host,
    output::{lock_outputs, replace_files},
    render,
};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Options {
    project_root: PathBuf,
    targets: Vec<String>,
    changed_files: BTreeSet<PathBuf>,
    should_resolve_imports: bool,
}

pub fn generate() -> Result<()> {
    let mut options: Options = host::read_message()?;
    options.project_root = options.project_root.canonicalize()?;
    options.changed_files = options
        .changed_files
        .iter()
        .map(|file| file.canonicalize())
        .collect::<std::io::Result<_>>()?;
    let root = options.project_root.join("src/lib/components");
    let _lock = lock_outputs(&root)?;
    let directories = collect_directories(&root)?;
    let targets = resolve_targets(&root, &directories, &options.targets)?;
    let (inputs, orphans) = collect_inputs(&targets)?;
    let mut graph = SourceGraph::new(&options.project_root);
    let generator_hash = hash_generator(&options.project_root)?;
    let mut components = Vec::new();

    for input in inputs {
        let mut roots = vec![input.props_file.clone()];
        roots.extend(input.svelte_files.iter().cloned());
        let sources = if options.should_resolve_imports {
            graph.collect_source_files_with(&roots, &mut host::resolve)?
        } else {
            graph.collect_source_files(&roots)?
        };

        if !options.changed_files.is_empty() && sources.is_disjoint(&options.changed_files) {
            continue;
        }

        let hash = hash_sources(&sources, &generator_hash)?;
        let destination = input.props_file.with_file_name("docs.ts");
        let marker = format!("// @quaffHash {hash}");

        if read_output(&destination)?
            .is_some_and(|contents| contents.lines().any(|line| line == marker))
        {
            continue;
        }

        components.push((generate_component(input)?, hash));
    }

    let outputs = render::render(components, &mut host::format)?;
    let mut changed = Vec::new();

    for output in outputs {
        if read_output(&output.destination)?.as_deref() != Some(&output.contents) {
            changed.push(output);
        }
    }

    // Stop the generation timeout before file replacement can begin.
    host::prepare_commit()?;
    replace_files(&changed, &orphans)
}

fn collect_directories(root: &Path) -> Result<BTreeSet<PathBuf>> {
    let mut directories = BTreeSet::new();

    for entry in fs::read_dir(root)? {
        let entry = entry?;

        if entry.file_type()?.is_dir() {
            directories.insert(entry.path());
        }
    }

    Ok(directories)
}

fn resolve_targets(
    root: &Path,
    directories: &BTreeSet<PathBuf>,
    targets: &[String],
) -> Result<BTreeSet<PathBuf>> {
    let canonical_root = root.canonicalize()?;
    let mut selected = BTreeSet::new();

    for target in targets
        .iter()
        .map(|target| target.trim())
        .filter(|target| !target.is_empty())
    {
        let directory = root.join(target);

        if directories.contains(&directory) {
            selected.insert(directory);
            continue;
        }

        let mut absolute = PathBuf::new();

        for component in std::env::current_dir()?.join(target).components() {
            match component {
                Component::ParentDir => {
                    absolute.pop();
                }
                Component::CurDir => {}
                _ => absolute.push(component),
            }
        }

        let canonical_target = canonicalize_target(&absolute)?;
        let relative = canonical_target
            .strip_prefix(&canonical_root)
            .map_err(|_| {
                format!(
                    "Target is not within the components directory ({}): {target}",
                    root.display()
                )
            })?;
        let Some(component) = relative.components().next() else {
            return Ok(directories.clone());
        };
        let directory = root.join(component);

        if !directories.contains(&directory) {
            return Err(format!("Component directory not found for target: {target}").into());
        }

        selected.insert(directory);
    }

    Ok(if selected.is_empty() {
        directories.clone()
    } else {
        selected
    })
}

// A target can name a deleted file inside an existing component.
fn canonicalize_target(path: &Path) -> std::io::Result<PathBuf> {
    match path.canonicalize() {
        Ok(resolved) => Ok(resolved),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            let (Some(parent), Some(name)) = (path.parent(), path.file_name()) else {
                return Err(error);
            };

            Ok(canonicalize_target(parent)?.join(name))
        }
        Err(error) => Err(error),
    }
}

fn collect_inputs(
    directories: &BTreeSet<PathBuf>,
) -> Result<(Vec<DocgenComponentInput>, Vec<PathBuf>)> {
    let mut inputs = Vec::new();
    let mut orphans = Vec::new();

    for directory in directories {
        let props_file = directory.join("props.ts");
        let has_props = props_file.is_file();
        let obsolete = if has_props {
            &["docs.props.ts"][..]
        } else {
            &["docs.props.ts", "docs.ts"]
        };

        for name in obsolete {
            let file = directory.join(name);

            if read_output(&file)?.is_some_and(|contents| contents.starts_with(GENERATED_HEADER)) {
                orphans.push(file);
            }
        }

        if !has_props {
            continue;
        }

        let mut svelte_files = Vec::new();

        for entry in fs::read_dir(directory)? {
            let entry = entry?;

            if entry.file_type()?.is_file()
                && entry
                    .path()
                    .extension()
                    .is_some_and(|extension| extension == "svelte")
            {
                svelte_files.push(entry.path());
            }
        }

        svelte_files.sort();
        inputs.push(DocgenComponentInput {
            props_file,
            svelte_files,
        });
    }

    Ok((inputs, orphans))
}
