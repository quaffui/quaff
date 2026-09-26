use std::collections::HashMap;

use crate::{
    parser::{
        ExternalType, FunctionType, Interface, InterfaceProperty, InterfacePropertyFlags,
        InterfacePropertyKey, ParsedType, ReferenceType, StandardType, TemplateLiteralType,
        TupleElement, TypeOperatorKind, UtilityTKind,
    },
    resolver::TypeDefinition,
};

use super::{
    ToTs, ToTsDefinition, TsPrecedence,
    funcs::{render_generics, render_interface, render_type_literal},
};

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
        let parsed = if self.optional && self.label.is_none() {
            self.type_annotation.to_ts_nested(TsPrecedence::Array)
        } else {
            self.type_annotation.to_ts()
        };

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
                if self.flags.contains(InterfacePropertyFlags::OPTIONAL) {
                    format!(
                        "{}: {} | undefined;",
                        self.key.to_ts(),
                        self.type_annotation.to_ts_nested(TsPrecedence::Union)
                    )
                } else {
                    format!("{}: {};", self.key.to_ts(), self.type_annotation.to_ts())
                }
            }
            InterfacePropertyKey::Identifier(..) => {
                format!(
                    "{}{}: {};",
                    self.key.to_ts(),
                    if self.flags.contains(InterfacePropertyFlags::OPTIONAL) {
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
                check.to_ts_nested(TsPrecedence::Union),
                extends.to_ts_nested(TsPrecedence::Union),
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
            Self::Variable {
                kind, declarator, ..
            } => {
                format!("{kind} {};", declarator.replacen(self.name(), name, 1))
            }
        }
    }
}
