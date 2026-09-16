use std::path::Path;

/// Resolves local TypeScript modules relative to a source file or Quaff's `lib` aliases.
pub struct PathResolver<'a>(pub &'a Path);
