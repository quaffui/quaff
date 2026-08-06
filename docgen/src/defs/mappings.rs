use regex::Regex;
use std::{
    path::{Path, PathBuf},
    sync::OnceLock,
};

use crate::prelude::Result;

/// Maps external type names to their documentation URLs.
/// Regexes can capture named groups that will be formatted into the value string.
pub struct TypeSrcMapping {
    /// The type name or regex to match
    pub src: &'static str,
    /// Whether `src` should be interpreted as a regex pattern
    is_regex: bool,
    /// Lazily compiled regex, populated on first use
    regex_cache: OnceLock<Regex>,
    /// The URL to the documentation source.
    ///
    /// For regexes, named groups can be formatted into the value string.
    /// The named groups can be referenced in the value string as `$name`.
    pub value: &'static str,
}

impl TypeSrcMapping {
    /// Creates a new string-based mapping
    const fn new_string(src: &'static str, value: &'static str) -> Self {
        TypeSrcMapping {
            src,
            is_regex: false,
            regex_cache: OnceLock::new(),
            value,
        }
    }

    /// Creates a new regex-based mapping
    const fn new_regex(src: &'static str, value: &'static str) -> Self {
        TypeSrcMapping {
            src,
            is_regex: true,
            regex_cache: OnceLock::new(),
            value,
        }
    }

    /// Returns the compiled regex, compiling it on first access.
    fn regex(&self) -> &Regex {
        self.regex_cache
            .get_or_init(|| Regex::new(self.src).unwrap())
    }

    /// Checks if the given name matches the source of this mapping.
    pub fn matches(&self, name: &str) -> bool {
        if self.is_regex {
            self.regex().is_match(name)
        } else {
            self.src == name
        }
    }

    /// Maps the given name to its documentation URL.
    pub fn map(&self, name: &str) -> String {
        if self.is_regex {
            self.regex().replace_all(name, self.value).to_string()
        } else {
            self.src.to_string()
        }
    }
}

pub static TYPE_SRC_MAPPINGS: [TypeSrcMapping; 14] = [
    TypeSrcMapping::new_string("MaterialSymbol", "https://fonts.google.com/icons"),
    TypeSrcMapping::new_string(
        "BundledLanguage",
        "https://shiki.style/languages#bundled-languages",
    ),
    TypeSrcMapping::new_string(
        "SpecialLanguage",
        "https://shiki.style/languages#special-languages",
    ),
    TypeSrcMapping::new_string("BundledTheme", "https://shiki.style/themes#bundled-themes"),
    TypeSrcMapping::new_string(
        "Snippet",
        "https://svelte.dev/docs/svelte/snippet#Typing-snippets",
    ),
    TypeSrcMapping::new_string(
        "HTMLElementTagNameMap",
        "https://typhonjs-typedoc.github.io/ts-lib-docs/2024/dom/interfaces/HTMLElementTagNameMap.html",
    ),
    TypeSrcMapping::new_regex(
        r#"^(?<event>[A-Z][a-z]+Event)Handler<.*>$"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/${event}",
    ),
    TypeSrcMapping::new_regex(
        r#"^(?<element>HTML(?:.+)?Element)$"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/${element}",
    ),
    // Specific indexed patterns must come before their general counterparts
    // so that `.find()` matches them first (replaces the former look-ahead).
    TypeSrcMapping::new_regex(
        r#"HTML(?<element>.+)Attributes\["(?<prop>\w+)"\]"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}",
    ),
    TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTMLElement>\["(?<prop>\w+)"\]"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Global_attributes/${prop}",
    ),
    TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTML(?<element>.+)Element>\["(?<prop>\w+)"\]"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}",
    ),
    // General (non-indexed) patterns come after their indexed variants.
    TypeSrcMapping::new_regex(
        r#"^HTMLAttributes<HTMLElement>$"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Global_attributes#list_of_global_attributes",
    ),
    TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTML(?<element>.+)Element>"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Elements/${element}#attributes",
    ),
    TypeSrcMapping::new_regex(
        r#"HTML(?<element>.+)Attributes"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Elements/${element}#attributes",
    ),
];

pub struct PathResolver<'a>(pub &'a Path);

impl<'a> PathResolver<'a> {
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
    let dirents = std::fs::read_dir(path)?;

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
