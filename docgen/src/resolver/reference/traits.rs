use oxc_semantic::Semantic;

use crate::{
    Result,
    resolver::{PathResolver, ResolvedReference},
};

/// Finds declarations referenced locally or through TypeScript module exports.
pub trait ReferenceResolver {
    /// Visits the referenced declaration with the resolver for its source file.
    fn resolve<T: for<'a> FnMut(ResolvedReference<'a>, &PathResolver) -> Result<()>>(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        callback: &mut T,
    ) -> Result<()>;
}

/// Matches supported declaration nodes against an exported name.
pub trait ReferenceNodeMatcher {
    /// Invokes the callback for matching declarations and reports whether one was found.
    fn resolve_matching_node<
        T: for<'a> FnMut(ResolvedReference<'a>, &PathResolver<'a>) -> Result<()>,
    >(
        &self,
        match_target: &str,
        semantic: &Semantic,
        resolver: &PathResolver,
        callback: &mut T,
    ) -> Result<bool>;
}
