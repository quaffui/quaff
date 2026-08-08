use oxc::ast::ast::TSTypeParameterDeclaration;
use oxc::span::Span;
use oxc_semantic::Semantic;

use crate::defs::{ParsedComment, ParsedGeneric, PathResolver, TypeDependencies};
use crate::parser::parse_type;
use crate::prelude::{Result, SpanDisplay};

pub fn extract_generics(
    decl: &TSTypeParameterDeclaration,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<Vec<ParsedGeneric>> {
    let mut generics: Vec<ParsedGeneric> = Vec::new();

    for param in &decl.params {
        let name = param.name.to_string();
        let constraint = param
            .constraint
            .as_ref()
            .map(|t| parse_type(t, type_deps, semantic, resolver, &[], &vec![]))
            .transpose()?;
        let default = param
            .default
            .as_ref()
            .map(|t| parse_type(t, type_deps, semantic, resolver, &[], &vec![]))
            .transpose()?;

        generics.push(ParsedGeneric {
            name,
            constraint,
            default,
        });
    }

    Ok(generics)
}

pub fn extract_prop_comment_info(
    prop_key_span: &Span,
    semantic: &Semantic,
) -> Result<Option<ParsedComment>> {
    let maybe_comment = semantic
        .comments()
        .iter()
        .find(|comment| comment.attached_to == prop_key_span.start);

    let Some(comment) = maybe_comment else {
        return Ok(None);
    };

    let content = comment.span.display(semantic);

    let mut description_lines = Vec::new();
    let mut default = None;

    let lines: Vec<&str> = content.lines().collect();

    for line in lines {
        let text = line.trim_start_matches(|c| !char::is_alphanumeric(c) && c != '@');

        if text.starts_with("@default") {
            if let Some(default_value) = text.strip_prefix("@default") {
                default = Some(default_value.trim().to_string())
            }

            continue;
        }

        let trimmed = text.trim();
        if trimmed.is_empty() {
            continue;
        }

        description_lines.push(trimmed.to_string());
    }

    Ok(Some(ParsedComment {
        description: description_lines.join("\n"),
        default,
    }))
}
