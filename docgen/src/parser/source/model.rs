use std::path::Path;

/// Represents the type of source file to parse.
pub enum SourceType<'a> {
    /// TypeScript file.
    TS(&'a Path),
    /// Svelte file.
    Svelte(&'a Path),
}
