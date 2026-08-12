use std::collections::HashMap;

use crate::{
    extractor::generics::GenericInfo,
    parser::types::{
        ExternalType, ParsedType, ReferenceType, StandardType, TemplateLiteralType, TupleElement,
        TypeOperatorKind,
        functions::FunctionType,
        interfaces::{Interface, InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        ts_utilities::UtilityTKind,
    },
    resolver::dependency::TypeDefinition,
};

use super::{ToTs, ToTsDefinition, TsPrecedence};

impl ToTs for StandardType {
    fn to_ts(&self) -> String {
        self.name.clone()
    }
}

impl ToTs for ExternalType {
    fn to_ts(&self) -> String {
        self.name.clone()
    }
}

impl ToTs for ReferenceType {
    fn to_ts(&self) -> String {
        if self.type_args.is_empty() {
            return self.name.clone();
        }

        format!(
            "{}<{}>",
            self.name,
            self.type_args
                .iter()
                .map(ToTs::to_ts)
                .collect::<Vec<_>>()
                .join(", ")
        )
    }
}

impl ToTs for TemplateLiteralType {
    fn to_ts(&self) -> String {
        let mut rendered = format!("`{}", self.head);

        for span in &self.spans {
            rendered.push_str("${");
            rendered.push_str(&span.type_annotation.to_ts());
            rendered.push('}');
            rendered.push_str(&span.literal);
        }

        rendered.push('`');
        rendered
    }
}

impl ToTs for HashMap<String, ParsedType> {
    fn to_ts(&self) -> String {
        if self.is_empty() {
            return "Snippet".to_string();
        }

        let mut params = self.iter().collect::<Vec<_>>();
        params.sort_unstable_by_key(|(name, _)| *name);

        let params = params
            .into_iter()
            .map(|(name, parsed)| format!("{name}: {}", parsed.to_ts()))
            .collect::<Vec<_>>()
            .join("; ");

        format!("Snippet<[{{ {params} }}]>")
    }
}

impl ToTs for TupleElement {
    fn to_ts(&self) -> String {
        let parsed = self.type_annotation.to_ts();

        match &self.label {
            Some(label) => format!(
                "{}{}{}: {parsed}",
                if self.rest { "..." } else { "" },
                label,
                if self.optional { "?" } else { "" }
            ),
            None => format!(
                "{}{}{}",
                if self.rest { "..." } else { "" },
                parsed,
                if self.optional { "?" } else { "" }
            ),
        }
    }
}

impl ToTs for InterfacePropertyKey {
    fn to_ts(&self) -> String {
        match self {
            Self::Identifier(name) => name.clone(),
            Self::IndexSignature {
                name,
                type_annotation,
            } => format!("[{name}: {}]", type_annotation.to_ts()),
        }
    }
}

impl ToTs for InterfaceProperty {
    fn to_ts(&self) -> String {
        match &self.key {
            InterfacePropertyKey::IndexSignature { .. } => {
                if self.flags.contains(InterfacePropertyFlags::Optional) {
                    format!(
                        "{}: {} | undefined;",
                        self.key.to_ts(),
                        self.type_annotation.to_ts()
                    )
                } else {
                    format!("{}: {};", self.key.to_ts(), self.type_annotation.to_ts())
                }
            }
            InterfacePropertyKey::Identifier(..) => {
                format!(
                    "{}{}: {};",
                    self.key.to_ts(),
                    if self.flags.contains(InterfacePropertyFlags::Optional) {
                        "?"
                    } else {
                        ""
                    },
                    self.type_annotation.to_ts()
                )
            }
        }
    }
}

impl ToTs for FunctionType {
    fn to_ts(&self) -> String {
        let generics = render_generics(&self.generics);
        let params = self
            .params
            .iter()
            .map(|param| {
                format!(
                    "{}{}: {}",
                    param.name,
                    if param.optional { "?" } else { "" },
                    param.type_annotation.to_ts()
                )
            })
            .collect::<Vec<_>>()
            .join(", ");

        format!(
            "{generics}({params}) => {}",
            self.return_type.to_ts_nested(TsPrecedence::Function)
        )
    }

    fn ts_precedence(&self) -> TsPrecedence {
        TsPrecedence::Function
    }
}

impl ToTs for Interface {
    fn to_ts(&self) -> String {
        render_type_literal(&self.properties)
    }
}

impl ToTs for ParsedType {
    fn to_ts(&self) -> String {
        match self {
            Self::External(parsed) => parsed.to_ts(),
            Self::Standard(parsed) => parsed.to_ts(),
            Self::Reference(parsed) => parsed.to_ts(),
            Self::TemplateLiteral(parsed) => parsed.to_ts(),
            Self::Snippet(params) => params.to_ts(),
            Self::UtilityT { kind, t } => match kind {
                UtilityTKind::Array => {
                    format!("{}[]", t.to_ts_nested(TsPrecedence::Array))
                }
                _ => format!("{kind}<{}>", t.to_ts()),
            },
            Self::UtilityKV { kind, k, v } => {
                format!("{kind}<{}, {}>", k.to_ts(), v.to_ts())
            }
            Self::Interface(interface) => interface.to_ts(),
            Self::TypeLiteral(properties) => render_type_literal(properties),
            Self::Function(function) => function.to_ts(),
            Self::Tuple(elements) => format!(
                "[{}]",
                elements
                    .iter()
                    .map(ToTs::to_ts)
                    .collect::<Vec<_>>()
                    .join(", ")
            ),
            Self::TypeOperator {
                kind,
                type_annotation,
            } => {
                let operator = match kind {
                    TypeOperatorKind::Keyof => "keyof",
                    TypeOperatorKind::Unique => "unique",
                    TypeOperatorKind::Readonly => "readonly",
                };

                format!(
                    "{operator} {}",
                    type_annotation.to_ts_nested(TsPrecedence::TypeOperator)
                )
            }
            Self::IndexedAccess { object, index } => format!(
                "{}[{}]",
                object.to_ts_nested(TsPrecedence::IndexedAccess),
                index.to_ts()
            ),
            Self::Conditional {
                check,
                extends,
                true_type,
                false_type,
            } => format!(
                "{} extends {} ? {} : {}",
                check.to_ts_nested(TsPrecedence::Function),
                extends.to_ts_nested(TsPrecedence::Function),
                true_type.to_ts_nested(TsPrecedence::Conditional),
                false_type.to_ts_nested(TsPrecedence::Conditional)
            ),
            Self::Union(types) => types
                .iter()
                .map(|parsed| parsed.to_ts_nested(TsPrecedence::Union))
                .collect::<Vec<_>>()
                .join(" | "),
            Self::Intersection(types) => types
                .iter()
                .map(|parsed| parsed.to_ts_nested(TsPrecedence::Intersection))
                .collect::<Vec<_>>()
                .join(" & "),
        }
    }

    fn ts_precedence(&self) -> TsPrecedence {
        match self {
            Self::Conditional { .. } => TsPrecedence::Conditional,
            Self::Function(_) => TsPrecedence::Function,
            Self::Union(_) => TsPrecedence::Union,
            Self::Intersection(_) => TsPrecedence::Intersection,
            Self::TypeOperator { .. } => TsPrecedence::TypeOperator,
            Self::UtilityT {
                kind: UtilityTKind::Array,
                ..
            } => TsPrecedence::Array,
            Self::IndexedAccess { .. } => TsPrecedence::IndexedAccess,
            _ => TsPrecedence::Primary,
        }
    }
}

impl ToTsDefinition for TypeDefinition {
    fn to_ts_definition(&self) -> String {
        self.to_ts_definition_as(self.name())
    }

    fn to_ts_definition_as(&self, name: &str) -> String {
        match self {
            Self::TypeAlias {
                generics, value, ..
            } => format!(
                "type {name}{} = {};",
                render_generics(generics),
                value.to_ts()
            ),
            Self::Interface(interface) => render_interface(interface, name),
        }
    }
}

fn render_generics(generics: &[GenericInfo]) -> String {
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

fn render_interface(interface: &Interface, name: &str) -> String {
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

fn render_type_literal(properties: &[InterfaceProperty]) -> String {
    let body = render_properties(properties);

    if body.is_empty() {
        "{}".to_string()
    } else {
        format!("{{\n{}\n}}", indent(&body))
    }
}

fn render_properties(properties: &[InterfaceProperty]) -> String {
    properties
        .iter()
        .map(ToTs::to_ts)
        .collect::<Vec<_>>()
        .join("\n")
}

fn indent(value: &str) -> String {
    value
        .lines()
        .map(|line| format!("  {line}"))
        .collect::<Vec<_>>()
        .join("\n")
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::{
        extractor::generics::GenericInfo,
        parser::types::{
            ParsedType, StandardType, TemplateLiteralSpan, TemplateLiteralType, TupleElement,
            TypeOperatorKind,
            functions::{FunctionType, FunctionTypeParam},
            interfaces::{
                Interface, InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey,
            },
            ts_utilities::UtilityKVKind,
        },
        resolver::dependency::TypeDefinition,
    };

    use super::*;

    fn standard(name: &str) -> ParsedType {
        ParsedType::Standard(StandardType::new(name.to_string()))
    }

    fn property(name: &str, parsed: ParsedType, optional: bool) -> InterfaceProperty {
        InterfaceProperty {
            key: InterfacePropertyKey::Identifier(name.to_string()),
            type_annotation: parsed,
            flags: if optional {
                InterfacePropertyFlags::Optional
            } else {
                InterfacePropertyFlags::None
            },
            comment: None,
        }
    }

    #[test]
    fn renders_template_literals_structurally() {
        let parsed = ParsedType::TemplateLiteral(TemplateLiteralType {
            head: "url(".to_string(),
            spans: vec![
                TemplateLiteralSpan {
                    type_annotation: standard("string"),
                    literal: ") ".to_string(),
                },
                TemplateLiteralSpan {
                    type_annotation: standard("number"),
                    literal: "px".to_string(),
                },
            ],
        });

        assert_eq!(parsed.to_ts(), "`url(${string}) ${number}px`");
    }

    #[test]
    fn parenthesizes_types_according_to_precedence() {
        let union = ParsedType::Union(vec![standard("A"), standard("B")]);
        let array = ParsedType::UtilityT {
            kind: UtilityTKind::Array,
            t: Box::new(union),
        };
        assert_eq!(array.to_ts(), "(A | B)[]");

        let function = ParsedType::Function(Box::new(FunctionType {
            params: Vec::new(),
            return_type: standard("void"),
            generics: Vec::new(),
        }));
        let union = ParsedType::Union(vec![function, standard("string")]);
        assert_eq!(union.to_ts(), "(() => void) | string");

        let intersection = ParsedType::Intersection(vec![
            ParsedType::Union(vec![standard("A"), standard("B")]),
            standard("C"),
        ]);
        assert_eq!(intersection.to_ts(), "(A | B) & C");
    }

    #[test]
    fn renders_utilities_operators_indexed_access_and_conditionals() {
        let utility = ParsedType::UtilityKV {
            kind: UtilityKVKind::Exclude,
            k: Box::new(standard("QSize")),
            v: Box::new(standard("\"none\"")),
        };
        assert_eq!(utility.to_ts(), "Exclude<QSize, \"none\">");

        let indexed = ParsedType::IndexedAccess {
            object: Box::new(ParsedType::TypeOperator {
                kind: TypeOperatorKind::Keyof,
                type_annotation: Box::new(standard("T")),
            }),
            index: Box::new(standard("\"name\"")),
        };
        assert_eq!(indexed.to_ts(), "(keyof T)[\"name\"]");

        let conditional = ParsedType::Conditional {
            check: Box::new(standard("T")),
            extends: Box::new(standard("string")),
            true_type: Box::new(standard("A")),
            false_type: Box::new(standard("B")),
        };
        assert_eq!(conditional.to_ts(), "T extends string ? A : B");
    }

    #[test]
    fn renders_tuples_and_functions() {
        let tuple = ParsedType::Tuple(vec![
            TupleElement {
                label: Some("value".to_string()),
                type_annotation: standard("string"),
                optional: true,
                rest: false,
            },
            TupleElement {
                label: Some("rest".to_string()),
                type_annotation: standard("number[]"),
                optional: false,
                rest: true,
            },
        ]);
        assert_eq!(tuple.to_ts(), "[value?: string, ...rest: number[]]");

        let function = ParsedType::Function(Box::new(FunctionType {
            params: vec![FunctionTypeParam {
                name: "value".to_string(),
                type_annotation: standard("T"),
                optional: false,
            }],
            return_type: standard("T"),
            generics: vec![GenericInfo {
                name: "T".to_string(),
                constraint: Some(standard("string")),
                default: None,
            }],
        }));
        assert_eq!(function.to_ts(), "<T extends string>(value: T) => T");
    }

    #[test]
    fn renders_snippet_parameters_deterministically() {
        let mut params = HashMap::new();
        params.insert("zebra".to_string(), standard("number"));
        params.insert("alpha".to_string(), standard("string"));

        assert_eq!(
            ParsedType::Snippet(params).to_ts(),
            "Snippet<[{ alpha: string; zebra: number }]>"
        );
    }

    #[test]
    fn renders_alias_generics_constraints_and_defaults() {
        let definition = TypeDefinition::TypeAlias {
            name: "Box".to_string(),
            generics: vec![GenericInfo {
                name: "T".to_string(),
                constraint: Some(standard("Serializable")),
                default: Some(standard("string")),
            }],
            value: ParsedType::TypeLiteral(vec![property("value", standard("T"), false)]),
        };

        assert_eq!(
            definition.to_ts_definition(),
            "type Box<T extends Serializable = string> = {\n  value: T;\n};"
        );
    }

    #[test]
    fn renders_interfaces_with_optional_and_index_properties() {
        let definition = TypeDefinition::Interface(Interface {
            name: "Dictionary".to_string(),
            generics: vec![GenericInfo {
                name: "T".to_string(),
                constraint: None,
                default: None,
            }],
            properties: vec![
                property("selected", standard("T"), true),
                InterfaceProperty {
                    key: InterfacePropertyKey::IndexSignature {
                        name: "key".to_string(),
                        type_annotation: standard("string"),
                    },
                    type_annotation: standard("T"),
                    flags: InterfacePropertyFlags::None,
                    comment: None,
                },
                InterfaceProperty {
                    key: InterfacePropertyKey::IndexSignature {
                        name: "optionalKey".to_string(),
                        type_annotation: standard("number"),
                    },
                    type_annotation: standard("T"),
                    flags: InterfacePropertyFlags::Optional,
                    comment: None,
                },
            ],
            dom_props_heritage: Some(Box::new(standard("Base"))),
        });

        assert_eq!(
            definition.to_ts_definition(),
            "interface Dictionary<T> extends Base {\n  selected?: T;\n  [key: string]: T;\n  [optionalKey: number]: T | undefined;\n}"
        );
        assert_eq!(
            definition.to_ts_definition_as("LocalDictionary"),
            "interface LocalDictionary<T> extends Base {\n  selected?: T;\n  [key: string]: T;\n  [optionalKey: number]: T | undefined;\n}"
        );
    }
}
