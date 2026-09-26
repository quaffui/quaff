use oxc_semantic::{AstNode, Semantic};

use crate::resolver::PathResolver;

/// Extracts a Svelte-specific AST item and parses its documentation metadata.
pub trait SvelteParser<'a>: Sized {
    /// Metadata produced by the selected AST item.
    type Output;

    /// Selects the supported Svelte construct from an AST node.
    fn extract(node: &'a AstNode) -> Option<Self>;

    /// Parses metadata with access to semantic information and reference resolution.
    fn parse(&mut self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output {
        let _ = self;
        let _ = semantic;
        let _ = resolver;
        panic!("SvelteParser::parse should not be called without proper implementation.")
    }
}
