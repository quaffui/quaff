use std::fs::read_to_string;

use oxc::{
    allocator::Allocator,
    parser::{Parser, ParserReturn},
    span::SourceType as OxcSrcType,
};
use oxc_semantic::{AstNode, Semantic, SemanticBuilder};

use crate::Result;

use super::{ParseCallback, ParseSource, SourceType, funcs::instance_script};

impl<'a, T: FnMut(&AstNode, &Semantic<'a>) -> Result<bool>> ParseCallback<'a> for T {}

impl ParseSource for String {
    /// Parses the given TS code and calls `cb` for each AST node.
    ///
    /// If `cb` returns `true`, the node lookup will stop and the function will return.
    /// Else the parsing will continue with the next node.
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, mut callback: U) -> Result<()> {
        let allocator = Allocator::default();
        let src_type = OxcSrcType::ts();
        let ParserReturn {
            program,
            diagnostics,
            ..
        } = Parser::new(&allocator, self, src_type).parse();

        if !diagnostics.is_empty() {
            return Err(format!(
                "Invalid TypeScript source: {}",
                diagnostics
                    .iter()
                    .map(ToString::to_string)
                    .collect::<Vec<_>>()
                    .join("; ")
            )
            .into());
        }

        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program)
            .semantic;

        for node in semantic.nodes() {
            if callback(node, &semantic)? {
                break;
            }
        }

        Ok(())
    }
}

impl<'b> ParseSource for SourceType<'b> {
    /// Parses the given source file and calls `cb` for each AST node.
    ///
    /// If `cb` returns `true`, the node lookup will stop and the function will return.
    /// Else the parsing will continue with the next node.
    ///
    /// For Svelte files, parses the instance script and leaves module exports out of component docs.
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, callback: U) -> Result<()> {
        match self {
            Self::TS(path) => {
                let content = read_to_string(path)?;
                content.parse_source(callback)
            }
            Self::Svelte(path) => {
                let content = read_to_string(path)?;

                if let Some(script) = instance_script(&content) {
                    script.to_string().parse_source(callback)
                } else {
                    Ok(())
                }
            }
        }
    }
}
