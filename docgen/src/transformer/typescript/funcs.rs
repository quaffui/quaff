use crate::{
    extractor::GenericInfo,
    parser::{Interface, InterfaceProperty},
};

use super::ToTs;

/// Renders generic parameter names, constraints, and defaults as TypeScript.
pub(super) fn render_generics(generics: &[GenericInfo]) -> String {
    if generics.is_empty() {
        return String::new();
    }

    format!(
        "<{}>",
        generics
            .iter()
            .map(|generic| {
                let mut rendered = generic.name.clone();

                if let Some(constraint) = &generic.constraint {
                    rendered.push_str(" extends ");
                    rendered.push_str(&constraint.to_ts());
                }

                if let Some(default) = &generic.default {
                    rendered.push_str(" = ");
                    rendered.push_str(&default.to_ts());
                }

                rendered
            })
            .collect::<Vec<_>>()
            .join(", ")
    )
}

/// Renders a named interface with its generic parameters, heritage, and body.
pub(super) fn render_interface(interface: &Interface, name: &str) -> String {
    let heritage = interface
        .dom_props_heritage
        .as_ref()
        .map(|heritage| format!(" extends {}", heritage.to_ts()))
        .unwrap_or_default();
    let body = render_properties(&interface.properties);

    if body.is_empty() {
        format!(
            "interface {name}{}{heritage} {{}}",
            render_generics(&interface.generics)
        )
    } else {
        format!(
            "interface {name}{}{heritage} {{\n{}\n}}",
            render_generics(&interface.generics),
            indent(&body)
        )
    }
}

/// Renders an anonymous object type from its properties.
pub(super) fn render_type_literal(properties: &[InterfaceProperty]) -> String {
    let body = render_properties(properties);

    if body.is_empty() {
        "{}".to_string()
    } else {
        format!("{{\n{}\n}}", indent(&body))
    }
}

/// Renders properties in their existing declaration order.
fn render_properties(properties: &[InterfaceProperty]) -> String {
    properties
        .iter()
        .map(ToTs::to_ts)
        .collect::<Vec<_>>()
        .join("\n")
}

/// Indents each line of a generated declaration body by two spaces.
fn indent(value: &str) -> String {
    value
        .lines()
        .map(|line| format!("  {line}"))
        .collect::<Vec<_>>()
        .join("\n")
}
