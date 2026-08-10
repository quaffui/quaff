use oxc_semantic::{AstNode, Semantic};

use crate::resolver::PathResolver;

pub trait SvelteParser<'a>: Sized {
    type Output;

    fn extract(node: &'a AstNode) -> Option<Self>;

    fn parse(&mut self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output {
        let _ = self;
        let _ = semantic;
        let _ = resolver;
        panic!("SvelteParser::parse should not be called without proper implementation.")
    }
}
