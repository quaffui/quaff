use std::fs::read_to_string;

use oxc::{
    allocator::Allocator,
    parser::{Parser, ParserReturn},
    span::SourceType as OxcSrcType,
};
use oxc_semantic::{AstNode, Semantic, SemanticBuilder};
use regex::Regex;

use crate::Result;

use super::{ParseSource, SourceType, traits::ParseCallback};

impl<'a, T: FnMut(&AstNode, &Semantic<'a>) -> Result<bool>> ParseCallback<'a> for T {}

impl ParseSource for String {
    /// Parses the given TS code and calls `cb` for each AST node.
    ///
    /// If `cb` returns `true`, the node lookup will stop and the function will return.
    /// Else the parsing will continue with the next node.
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, mut callback: U) -> Result<()> {
        let allocator = Allocator::default();
        let src_type = OxcSrcType::ts();
        let ParserReturn { program, .. } = Parser::new(&allocator, &self, src_type).parse();

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
    /// If the source file is a Svelte file, the script tag is expected to be in the format
    /// `<script lang="ts">...</script>`, with an optional `generics` attribute (which is ignored).
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, callback: U) -> Result<()> {
        match self {
            Self::TS(path) => {
                let content = read_to_string(path)?;
                content.parse_source(callback)
            }
            Self::Svelte(path) => {
                let content = read_to_string(path)?;
                let script_regex =
                    Regex::new(r#"(?s)<script lang="ts"(?:\sgenerics=".*")?>(.*?)</script>"#)
                        .unwrap();

                let captures = script_regex.captures(&content).unwrap();
                let script_content = captures.get(1).unwrap().as_str().to_string();

                script_content.parse_source(callback)
            }
        }
    }
}
