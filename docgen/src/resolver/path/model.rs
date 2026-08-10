use std::path::Path;

/// Utility struct to resolve file imports (relative, $alias, etc.) based on the given `props.ts` file path.
///
/// This is used because `oxc` doesn't resolve type references like typescript can, so we have to
/// manually resolve them.
/// Relative paths are resolved based on the location of the `props.ts` file and path aliases (like $utils) based
/// on the `lib` directory.
///
/// As typescript allows you to import from folders using `index.ts` files (or re-exporting from
/// subdirectories), the `resolve` function will recursively walk the file system to find the file.
pub struct PathResolver<'a>(pub &'a Path);
