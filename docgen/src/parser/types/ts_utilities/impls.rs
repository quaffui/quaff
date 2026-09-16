use std::fmt::Display;
use std::str::FromStr;

use oxc::ast::ast::IdentifierReference;

use crate::{
    Result,
    extractor::generics::GenericBindings,
    parser::types::{ParsedType, StandardType, TypeParser, UtilityTypeParser},
    resolver::{PathResolver, dependency::TypeRegistry},
};

use super::{UtilityKVKind, UtilityTKind, UtilityType, macros::impl_utility_enum};

impl_utility_enum!(
    UtilityTKind,
    Array,
    InstanceType,
    NonNullable,
    Parameters,
    Partial,
    Readonly,
    Required,
    ReturnType,
);

impl_utility_enum!(UtilityKVKind, Exclude, Extract, Omit, Pick, Record);

impl UtilityKVKind {
    /// Simplifies exclusion and omission utility types when the second argument is `undefined` or `never`.
    pub fn simplify(self, k: ParsedType, v: ParsedType) -> ParsedType {
        match self {
            Self::Exclude => {
                if is_standard_type(&v, "never") {
                    return k;
                }

                if is_standard_type(&v, "undefined") && can_remove_undefined(&k) {
                    return filter_undefined_or_never(k).unwrap_or_else(|| {
                        ParsedType::Standard(StandardType::new("never".to_string()))
                    });
                }

                ParsedType::UtilityKV {
                    kind: Self::Exclude,
                    k: Box::new(k),
                    v: Box::new(v),
                }
            }
            Self::Omit => {
                let clean_v = filter_undefined_or_never(v);

                let Some(v) = clean_v else {
                    return k;
                };

                ParsedType::UtilityKV {
                    kind: Self::Omit,
                    k: Box::new(k),
                    v: Box::new(v),
                }
            }
            _ => ParsedType::UtilityKV {
                kind: self,
                k: Box::new(k),
                v: Box::new(v),
            },
        }
    }
}

fn is_standard_type(parsed: &ParsedType, expected: &str) -> bool {
    match parsed {
        ParsedType::Standard(standard) => standard.name == expected,
        ParsedType::Reference(reference) => is_standard_type(&reference.parsed, expected),
        _ => false,
    }
}

fn can_remove_undefined(parsed: &ParsedType) -> bool {
    match parsed {
        ParsedType::Standard(standard) => {
            matches!(
                standard.name.as_str(),
                "undefined"
                    | "never"
                    | "string"
                    | "number"
                    | "boolean"
                    | "bigint"
                    | "symbol"
                    | "object"
                    | "null"
                    | "true"
                    | "false"
            ) || standard.name.starts_with(['"', '\''])
                || standard.name.parse::<f64>().is_ok()
        }
        ParsedType::Reference(reference) => is_definitely_defined(&reference.parsed),
        ParsedType::Union(types) => types.iter().all(can_remove_undefined),
        _ => is_definitely_defined(parsed),
    }
}

fn is_definitely_defined(parsed: &ParsedType) -> bool {
    match parsed {
        ParsedType::Reference(reference) => is_definitely_defined(&reference.parsed),
        ParsedType::Union(types) => types.iter().all(is_definitely_defined),
        ParsedType::Standard(standard) => {
            standard.name != "undefined" && can_remove_undefined(parsed)
        }
        ParsedType::TemplateLiteral(_)
        | ParsedType::TypeLiteral(_)
        | ParsedType::Interface(_)
        | ParsedType::Function(_)
        | ParsedType::Tuple(_) => true,
        _ => false,
    }
}

fn filter_undefined_or_never(parsed: ParsedType) -> Option<ParsedType> {
    if parsed.is_undefined_or_never() {
        return None;
    }

    if let ParsedType::Union(types) = parsed {
        let mut filtered: Vec<ParsedType> = types
            .into_iter()
            .filter_map(filter_undefined_or_never)
            .collect();

        if filtered.is_empty() {
            return None;
        }

        if filtered.len() == 1 {
            return Some(filtered.remove(0));
        }

        return Some(ParsedType::Union(filtered));
    }

    Some(parsed)
}

impl UtilityTypeParser for IdentifierReference<'_> {
    fn parse_utility_type(
        &self,
        kind: UtilityType,
        reference: &oxc::ast::ast::TSTypeReference,
        semantic: &oxc_semantic::Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        let Some(type_args) = &reference.type_arguments else {
            return Err(format!("Found utility type {} without a type argument", self.name).into());
        };

        let Some(first_arg) = type_args.params.first() else {
            return Err(format!("Found utility type {} without a type argument", self.name).into());
        };

        match kind {
            UtilityType::T(utility_kind) => {
                let parsed_t =
                    first_arg.parse_type(semantic, resolver, generic_bindings, registry)?;

                Ok(ParsedType::UtilityT {
                    kind: utility_kind,
                    t: Box::new(parsed_t),
                })
            }
            UtilityType::KV(utility_kind) => {
                let Some(second_arg) = type_args.params.get(1) else {
                    return Err(format!(
                        "Found utility type {} without a second type argument",
                        self.name
                    )
                    .into());
                };

                let parsed_k =
                    first_arg.parse_type(semantic, resolver, generic_bindings, registry)?;
                let parsed_v =
                    second_arg.parse_type(semantic, resolver, generic_bindings, registry)?;

                Ok(utility_kind.simplify(parsed_k, parsed_v))
            }
        }
    }
}
