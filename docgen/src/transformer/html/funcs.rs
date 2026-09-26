use std::collections::HashMap;

use crate::{
    extractor::GenericInfo,
    parser::{ExternalType, ParsedType},
    transformer::{ToTs, TsPrecedence},
};

use super::{HtmlItem, ToHtml};

/// Escapes characters that can alter HTML text or attribute structure.
pub(super) fn escape_html(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());

    for character in value.chars() {
        match character {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            '"' => escaped.push_str("&quot;"),
            '\'' => escaped.push_str("&#39;"),
            other => escaped.push(other),
        }
    }

    escaped
}

/// Renders plain text without introducing an enclosing HTML element.
pub(super) fn text(value: impl AsRef<str>) -> String {
    HtmlItem::new(value).create_item()
}

/// Adds escaped parentheses when a nested type has lower precedence.
pub(super) fn render_nested(parsed: ParsedType, parent: TsPrecedence) -> String {
    if parsed.ts_precedence() < parent {
        format!("{}{}{}", text("("), parsed.to_html(), text(")"))
    } else {
        parsed.to_html()
    }
}

/// Renders a generic parameter with its optional constraint and default.
pub(super) fn render_generic(generic: GenericInfo) -> String {
    let mut result = text(generic.name);

    if let Some(constraint) = generic.constraint {
        result.push_str(&text(" extends "));
        result.push_str(&constraint.to_html());
    }

    if let Some(default) = generic.default {
        result.push_str(&text(" = "));
        result.push_str(&default.to_html());
    }

    result
}

/// Renders a sequence of types using the required operator precedence.
pub(super) fn render_joined(types: Vec<ParsedType>, joiner: &str, parent: TsPrecedence) -> String {
    types
        .into_iter()
        .map(|parsed| render_nested(parsed, parent))
        .collect::<Vec<_>>()
        .join(joiner)
}

/// Renders the linked Svelte Snippet type and its named parameters.
pub(super) fn render_snippet_type(params: HashMap<String, ParsedType>) -> String {
    let snippet = ExternalType::maybe_new("Snippet".to_string())
        .map(ToHtml::to_html)
        .unwrap_or_else(|| text("Snippet"));

    if params.is_empty() {
        return snippet;
    }

    format!(
        "{}{}{}{}",
        snippet,
        text("<[{ "),
        params.to_html(),
        text(" }]>"),
    )
}

/// Combines a property name and trusted rendered type into an API heading.
pub(super) fn entry_header(name: &str, type_content: String) -> String {
    let prop_name = HtmlItem::prop_name(name);
    let type_info = HtmlItem::new("")
        .tag("pre")
        .class("prop-type")
        .child_html(type_content)
        .create_item();

    HtmlItem::new("")
        .tag("div")
        .class("q-api__doc-heading q-my-sm")
        .child_html(prop_name + &type_info)
        .create_item()
}
