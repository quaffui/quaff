use oxc_semantic::Semantic;

use crate::{
    Result,
    resolver::{PathResolver, TypeRegistry},
};

/// Extracts documentation metadata from an AST node in its declaration context.
pub trait Extractor<T> {
    /// Reads metadata while resolving any referenced types through the shared registry.
    fn extract(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        registry: &mut TypeRegistry,
    ) -> Result<T>;
}
