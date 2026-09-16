use std::{collections::HashMap, fmt::Display};

use crate::{
    extractor::generics::GenericInfo,
    parser::types::{
        ExternalType, ParsedType, ReferenceType, StandardType, TemplateLiteralType, TupleElement,
        TypeOperatorKind,
        functions::FunctionType,
        interfaces::{Interface, InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        ts_utilities::UtilityTKind,
    },
    transformer::typescript::{ToTs, TsPrecedence},
};

use super::{HtmlItem, ToHtml};

impl Display for HtmlItem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.create_item())
    }
}

impl HtmlItem {
    /// Creates an item whose content is treated as text and HTML-escaped.
    pub fn new(content: impl AsRef<str>) -> Self {
        Self {
            content: escape_html(content.as_ref()),
            ..Default::default()
        }
    }

    pub fn prop_name(name: &str) -> String {
        Self::new("")
            .tag("span")
            .class("q-docs-code q-mr-xs")
            .child_html(Self::new(name).tag("b"))
            .create_item()
    }

    pub fn accent(mut self) -> Self {
        self.accent = true;
        self
    }

    pub fn reference(mut self) -> Self {
        self.is_reference = true;
        self
    }

    pub fn type_name(mut self, name: impl Into<String>) -> Self {
        self.type_name = name.into();
        self
    }

    pub fn type_src(mut self, src: impl Into<String>) -> Self {
        self.type_src = src.into();
        self
    }

    pub fn class(mut self, class: impl Into<String>) -> Self {
        self.class = Some(class.into());
        self
    }

    pub fn tag(mut self, tag: impl Into<String>) -> Self {
        self.tag = Some(tag.into());
        self
    }

    /// Replaces the escaped text with HTML assembled by this renderer.
    pub fn child_html(mut self, content: impl Into<String>) -> Self {
        self.content = content.into();
        self
    }

    pub fn create_item(&self) -> String {
        let mut classes = Vec::new();
        let mut attrs = Vec::new();
        let mut tag = self.tag.as_deref();

        if let Some(class) = &self.class {
            classes.push(class.as_str());
        }

        if self.accent {
            tag = Some("span");
            classes.push("accented");
        }

        if self.is_reference {
            tag = Some("span");
            classes.push("clickable");
            attrs.push("data-quaff".to_string());
            attrs.push(r#"tabindex="0""#.to_string());
            attrs.push(format!(
                r#"data-type-name="{}""#,
                escape_html(&self.type_name)
            ));
        }

        if !self.type_src.is_empty() {
            tag = Some("a");
            classes.push("clickable link");
            attrs.push(format!(r#"href="{}""#, escape_html(&self.type_src)));
            attrs.push(r#"target="_blank""#.to_string());
        }

        let classes_string = if classes.is_empty() {
            String::new()
        } else {
            format!(r#" class="{}""#, escape_html(&classes.join(" ")))
        };
        let attrs_string = if attrs.is_empty() {
            String::new()
        } else {
            format!(" {}", attrs.join(" "))
        };

        match tag {
            Some(tag) => {
                assert!(
                    !tag.is_empty()
                        && tag
                            .bytes()
                            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-'),
                    "invalid generated HTML tag"
                );

                format!(
                    "<{tag}{classes_string}{attrs_string}>{}</{tag}>",
                    self.content
                )
            }
            None => self.content.clone(),
        }
    }
}

fn escape_html(value: &str) -> String {
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

fn text(value: impl AsRef<str>) -> String {
    HtmlItem::new(value).create_item()
}

fn render_nested(parsed: ParsedType, parent: TsPrecedence) -> String {
    if parsed.ts_precedence() < parent {
        format!("{}{}{}", text("("), parsed.to_html(), text(")"))
    } else {
        parsed.to_html()
    }
}

fn render_generic(generic: GenericInfo) -> String {
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

fn render_joined(types: Vec<ParsedType>, joiner: &str, parent: TsPrecedence) -> String {
    types
        .into_iter()
        .map(|parsed| render_nested(parsed, parent))
        .collect::<Vec<_>>()
        .join(joiner)
}

fn render_snippet_type(params: HashMap<String, ParsedType>) -> String {
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

impl ToHtml for StandardType {
    fn to_html(self) -> String {
        HtmlItem::new(self.name).to_string()
    }
}

impl ToHtml for ExternalType {
    fn to_html(self) -> String {
        HtmlItem::new(self.name).type_src(self.type_src).to_string()
    }
}

impl ToHtml for ReferenceType {
    fn to_html(self) -> String {
        let display_name = self.to_ts();

        HtmlItem::new(&display_name)
            .reference()
            .type_name(display_name)
            .to_string()
    }
}

impl ToHtml for HashMap<String, ParsedType> {
    fn to_html(self) -> String {
        let mut entries = self.into_iter().collect::<Vec<_>>();
        entries.sort_by(|(left, _), (right, _)| left.cmp(right));

        entries
            .into_iter()
            .map(|(key, value)| format!("{}{}{}", text(key), text(": "), value.to_html()))
            .collect::<Vec<_>>()
            .join(&text(", "))
    }
}

impl ToHtml for Vec<InterfaceProperty> {
    fn to_html(self) -> String {
        let mapped = self
            .into_iter()
            .map(|prop| {
                let is_optional = prop.flags.contains(InterfacePropertyFlags::Optional);

                if is_optional && matches!(&prop.key, InterfacePropertyKey::IndexSignature { .. }) {
                    return format!(
                        "{}{}{}{}",
                        prop.key.to_html(),
                        text(": "),
                        render_nested(prop.type_annotation, TsPrecedence::Union),
                        text(" | undefined")
                    );
                }

                let optional = if is_optional {
                    text("?")
                } else {
                    String::new()
                };

                format!(
                    "{}{}{}{}",
                    prop.key.to_html(),
                    optional,
                    text(": "),
                    prop.type_annotation.to_html()
                )
            })
            .collect::<Vec<_>>()
            .join(&text(", "));

        format!("{}{}{}", text("{ "), mapped, text(" }"))
    }
}

impl ToHtml for InterfacePropertyKey {
    fn to_html(self) -> String {
        match self {
            Self::Identifier(name) => text(name),
            Self::IndexSignature {
                name,
                type_annotation,
            } => format!(
                "{}{}{}{}{}",
                text("["),
                text(name),
                text(": "),
                type_annotation.to_html(),
                text("]")
            ),
        }
    }
}

impl ToHtml for Interface {
    fn to_html(self) -> String {
        let mut result = text(format!("interface {}", self.name));

        if !self.generics.is_empty() {
            result.push_str(&text("<"));
            result.push_str(
                &self
                    .generics
                    .into_iter()
                    .map(render_generic)
                    .collect::<Vec<_>>()
                    .join(&text(", ")),
            );
            result.push_str(&text(">"));
        }

        result.push_str(&self.properties.to_html());
        result
    }
}

impl ToHtml for FunctionType {
    fn to_html(self) -> String {
        let mut result = String::new();

        if !self.generics.is_empty() {
            result.push_str(&text("<"));
            result.push_str(
                &self
                    .generics
                    .into_iter()
                    .map(render_generic)
                    .collect::<Vec<_>>()
                    .join(&text(", ")),
            );
            result.push_str(&text(">"));
        }

        result.push_str(&text("("));
        result.push_str(
            &self
                .params
                .into_iter()
                .map(|param| {
                    let optional = if param.optional {
                        text("?")
                    } else {
                        String::new()
                    };

                    format!(
                        "{}{}{}{}",
                        text(param.name),
                        optional,
                        text(": "),
                        param.type_annotation.to_html()
                    )
                })
                .collect::<Vec<_>>()
                .join(&text(", ")),
        );
        result.push_str(&text(") => "));
        result.push_str(&render_nested(self.return_type, TsPrecedence::Function));
        result
    }
}

impl ToHtml for TemplateLiteralType {
    fn to_html(self) -> String {
        let mut result = text(format!("`{}", self.head));

        for span in self.spans {
            result.push_str(&text("${"));
            result.push_str(&span.type_annotation.to_html());
            result.push_str(&text("}"));
            result.push_str(&text(span.literal));
        }

        result.push_str(&text("`"));
        result
    }
}

impl ToHtml for Vec<TupleElement> {
    fn to_html(self) -> String {
        let elements = self
            .into_iter()
            .map(|element| {
                let mut result = String::new();
                let has_label = element.label.is_some();

                if element.rest {
                    result.push_str(&text("..."));
                }

                if let Some(label) = element.label {
                    result.push_str(&text(label));

                    if element.optional {
                        result.push_str(&text("?"));
                    }

                    result.push_str(&text(": "));
                }

                let type_html = if !has_label && element.optional {
                    render_nested(element.type_annotation, TsPrecedence::Array)
                } else {
                    element.type_annotation.to_html()
                };
                result.push_str(&type_html);

                if !has_label && element.optional {
                    result.push_str(&text("?"));
                }

                result
            })
            .collect::<Vec<_>>()
            .join(&text(", "));

        format!("{}{}{}", text("["), elements, text("]"))
    }
}

impl ToHtml for ParsedType {
    fn to_html(self) -> String {
        match self {
            Self::Union(types) => render_joined(types, &text(" | "), TsPrecedence::Union),
            Self::Intersection(types) => {
                render_joined(types, &text(" & "), TsPrecedence::Intersection)
            }
            Self::Standard(inner) => inner.to_html(),
            Self::External(inner) => inner.to_html(),
            Self::Reference(inner) => inner.to_html(),
            Self::TemplateLiteral(inner) => inner.to_html(),
            Self::Snippet(inner) => render_snippet_type(inner),
            Self::Interface(inner) => inner.to_html(),
            Self::TypeLiteral(inner) => inner.to_html(),
            Self::Function(inner) => inner.to_html(),
            Self::Tuple(inner) => inner.to_html(),
            Self::TypeOperator {
                kind,
                type_annotation,
            } => {
                let operator = match kind {
                    TypeOperatorKind::Keyof => "keyof ",
                    TypeOperatorKind::Unique => "unique ",
                    TypeOperatorKind::Readonly => "readonly ",
                };

                format!(
                    "{}{}",
                    text(operator),
                    render_nested(*type_annotation, TsPrecedence::TypeOperator)
                )
            }
            Self::IndexedAccess { object, index } => format!(
                "{}{}{}{}",
                render_nested(*object, TsPrecedence::IndexedAccess),
                text("["),
                index.to_html(),
                text("]")
            ),
            Self::Conditional {
                check,
                extends,
                true_type,
                false_type,
            } => format!(
                "{}{}{}{}{}{}{}",
                render_nested(*check, TsPrecedence::Union),
                text(" extends "),
                render_nested(*extends, TsPrecedence::Union),
                text(" ? "),
                true_type.to_html(),
                text(" : "),
                false_type.to_html()
            ),
            Self::UtilityT { kind, t } => match kind {
                UtilityTKind::Array => {
                    format!("{}{}", render_nested(*t, TsPrecedence::Array), text("[]"))
                }
                _ => format!(
                    "{}{}{}{}",
                    text(kind.to_string()),
                    text("<"),
                    t.to_html(),
                    text(">")
                ),
            },
            Self::UtilityKV { kind, k, v } => format!(
                "{}{}{}{}{}{}",
                text(kind.to_string()),
                text("<"),
                k.to_html(),
                text(", "),
                v.to_html(),
                text(">")
            ),
        }
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::parser::types::{ExternalType, ParsedType, ReferenceType, StandardType};

    use super::{HtmlItem, ToHtml};

    #[test]
    fn escapes_text_and_attributes() {
        let item = HtmlItem::new(r#"<script>"'&"#)
            .tag("span")
            .class(r#"type" onclick="bad"#)
            .create_item();

        assert_eq!(
            item,
            r#"<span class="type&quot; onclick=&quot;bad">&lt;script&gt;&quot;&#39;&amp;</span>"#
        );
    }

    #[test]
    fn escapes_reference_names_and_external_urls() {
        let reference = ParsedType::Reference(ReferenceType {
            name: r#"A" onmouseover="bad"#.to_string(),
            type_args: Vec::new(),
            parsed: Box::new(ParsedType::Standard(StandardType {
                name: "string".to_string(),
            })),
        })
        .to_html();
        let external = ExternalType {
            name: "Type<unsafe>".to_string(),
            type_src: r#"https://example.test/?q="<&"#.to_string(),
        }
        .to_html();

        assert_eq!(
            reference,
            r#"<span class="clickable" data-quaff tabindex="0" data-type-name="A&quot; onmouseover=&quot;bad">A&quot; onmouseover=&quot;bad</span>"#
        );
        assert_eq!(
            external,
            r#"<a class="clickable link" href="https://example.test/?q=&quot;&lt;&amp;" target="_blank">Type&lt;unsafe&gt;</a>"#
        );
    }

    #[test]
    fn preserves_operator_precedence_in_html() {
        use crate::parser::types::{TypeOperatorKind, ts_utilities::UtilityTKind};
        use crate::transformer::typescript::ToTs;

        let standard = |name: &str| ParsedType::Standard(StandardType::new(name.to_string()));
        let union = || ParsedType::Union(vec![standard("A"), standard("B")]);
        let cases = [
            ParsedType::IndexedAccess {
                object: Box::new(union()),
                index: Box::new(standard("0")),
            },
            ParsedType::TypeOperator {
                kind: TypeOperatorKind::Keyof,
                type_annotation: Box::new(union()),
            },
            ParsedType::UtilityT {
                kind: UtilityTKind::Array,
                t: Box::new(ParsedType::TypeOperator {
                    kind: TypeOperatorKind::Readonly,
                    type_annotation: Box::new(ParsedType::UtilityT {
                        kind: UtilityTKind::Array,
                        t: Box::new(standard("string")),
                    }),
                }),
            },
        ];

        for parsed in cases {
            assert_eq!(parsed.clone().to_html(), parsed.to_ts());
        }
    }

    #[test]
    fn renders_snippet_types_inside_other_type_expressions() {
        let bare = ParsedType::Snippet(HashMap::new()).to_html();
        let parameterized = ParsedType::Snippet(HashMap::from([(
            "value".to_string(),
            ParsedType::Standard(StandardType::new("string".to_string())),
        )]))
        .to_html();

        assert!(bare.contains(">Snippet</a>"));
        assert!(parameterized.contains(">Snippet</a>&lt;[{ value: string }]&gt;"));
    }

    #[test]
    fn preserves_optional_tuple_index_and_conditional_grouping() {
        use crate::parser::types::{
            TupleElement,
            functions::FunctionType,
            interfaces::{InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        };

        let standard = |name: &str| ParsedType::Standard(StandardType::new(name.to_string()));
        let function = || {
            ParsedType::Function(Box::new(FunctionType {
                params: Vec::new(),
                return_type: standard("string"),
                generics: Vec::new(),
            }))
        };
        let tuple = ParsedType::Tuple(vec![TupleElement {
            label: None,
            type_annotation: ParsedType::Union(vec![standard("string"), standard("number")]),
            optional: true,
            rest: false,
        }]);
        assert_eq!(tuple.to_html(), "[(string | number)?]");

        let index = ParsedType::TypeLiteral(vec![InterfaceProperty {
            key: InterfacePropertyKey::IndexSignature {
                name: "key".to_string(),
                type_annotation: standard("string"),
            },
            type_annotation: function(),
            flags: InterfacePropertyFlags::Optional,
            comment: None,
        }]);
        assert_eq!(
            index.to_html(),
            "{ [key: string]: (() =&gt; string) | undefined }"
        );

        let conditional = ParsedType::Conditional {
            check: Box::new(function()),
            extends: Box::new(function()),
            true_type: Box::new(standard("true")),
            false_type: Box::new(standard("false")),
        };
        assert_eq!(
            conditional.to_html(),
            "(() =&gt; string) extends (() =&gt; string) ? true : false"
        );
    }
}
