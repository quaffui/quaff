use std::{fs::read_to_string, path::Path};

use oxc::{
    allocator::Allocator,
    ast::ast::Program,
    parser::{Parser, ParserReturn},
    span::SourceType,
};
use oxc_semantic::{AstNode, Semantic, SemanticBuilder};
use regex::Regex;

use crate::prelude::Result;

pub trait ParseCallback<'a>: FnMut(&AstNode, &Semantic<'a>, &Program<'a>) -> Result<bool> {}
impl<'a, T: FnMut(&AstNode, &Semantic<'a>, &Program<'a>) -> Result<bool>> ParseCallback<'a> for T {}

/// Parses the given TS code and calls `cb` for each AST node.
///
/// If `cb` returns `true`, the node lookup will stop and the function will return.
/// Else the parsing will continue with the next node.
pub fn parse_ts<T: for<'a> ParseCallback<'a>>(content: &str, mut cb: T) -> Result<()> {
    let allocator = Allocator::default();
    let src_type = SourceType::ts();
    let ParserReturn { program, .. } = Parser::new(&allocator, content, src_type).parse();

    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&program)
        .semantic;

    for node in semantic.nodes() {
        if cb(node, &semantic, &program)? {
            break;
        }
    }

    Ok(())
}

/// Parses the given TS file and calls `cb` for each AST node.
///
/// If `cb` returns `true`, the node lookup will stop and the function will return.
/// Else the parsing will continue with the next node.
pub fn parse_ts_file<T: for<'a> ParseCallback<'a>>(path: &Path, mut cb: T) -> Result<()> {
    let contents = read_to_string(path)?;

    parse_ts(&contents, &mut cb)
}

/// Parses the script section of a Svelte file and calls `cb` for each AST node.
///
/// If `cb` returns `true`, the node lookup will stop and the function will return.
/// Else the parsing will continue with the next node.
///
/// The script tag is expected to be in the format `<script lang="ts">...</script>`,
/// with an optional `generics` attribute (which is ignored).
pub fn parse_svelte_ts<'a, T: for<'b> ParseCallback<'b>>(path: &Path, mut cb: T) -> Result<()> {
    let content = match read_to_string(path) {
        Ok(c) => c,
        Err(_) => {
            println!("Skip parsing the file {}", path.display());
            return Ok(());
        }
    };

    let script_regex =
        Regex::new(r#"(?s)<script lang="ts"(?:\sgenerics=".*")?>(.*?)</script>"#).unwrap();

    let captures = script_regex.captures(&content).unwrap();
    let script_content = captures.get(1).unwrap().as_str();

    parse_ts(script_content, &mut cb)
}
