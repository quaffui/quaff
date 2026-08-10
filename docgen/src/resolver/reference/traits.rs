use oxc_semantic::Semantic;

use crate::{
    Result,
    resolver::{PathResolver, ResolvedReference},
};

pub trait ReferenceResolver {
    fn resolve<T: for<'a> FnMut(ResolvedReference<'a>, &PathResolver) -> Result<()>>(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        callback: &mut T,
    ) -> Result<()>;
}

pub trait ReferenceNodeMatcher {
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
