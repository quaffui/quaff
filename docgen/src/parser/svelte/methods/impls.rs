use oxc::ast::{
    AstKind,
    ast::{Declaration, ExportDeclaration, Function},
};
use oxc_semantic::{AstNode, Semantic};

use crate::{Result, parser::svelte::traits::SvelteParser, resolver::PathResolver};

use super::ParsedSvelteMethods;

impl<'a> SvelteParser<'a> for &'a Function<'a> {
    type Output = Result<ParsedSvelteMethods>;

    fn extract(node: &'a AstNode) -> Option<Self> {
        if let AstKind::ExportDeclaration(ExportDeclaration { declaration, .. }) = node.kind()
            && let Declaration::FunctionDeclaration(func) = declaration
        {
            return Some(func);
        }

        None
    }

    fn parse(self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output {
        todo!("Implement parsing of exported methods in Svelte files.")
    }
}
