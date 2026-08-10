use oxc_semantic::{AstNode, Semantic};

use crate::resolver::PathResolver;

pub trait SvelteParser<'a>: Sized {
    type Output;

    fn extract(node: &'a AstNode) -> Option<Self>;

    fn parse(self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output;
}
