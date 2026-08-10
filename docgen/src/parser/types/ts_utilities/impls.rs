use std::fmt::Display;
use std::str::FromStr;

use oxc::ast::ast::IdentifierReference;

use crate::{
    Result,
    extractor::generics::GenericInfo,
    parser::types::{ParsedType, TypeDependencies, TypeParser, UtilityTypeParser},
    resolver::PathResolver,
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

impl UtilityTypeParser for IdentifierReference<'_> {
    fn parse_utility_type(
        &self,
        kind: UtilityType,
        reference: &oxc::ast::ast::TSTypeReference,
        semantic: &oxc_semantic::Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType> {
        let Some(type_arg) = &reference.type_arguments else {
            return Err(format!("Found utility type {} without a type argument", self.name).into());
        };

        let Some(first_arg) = type_arg.params.first() else {
            return Err(format!("Found utility type {} without a type argument", self.name).into());
        };

        match kind {
            UtilityType::T(utility_kind) => {
                let parsed_t =
                    first_arg.parse_type(semantic, resolver, generics, &[], type_deps)?;

                Ok(ParsedType::UtilityT {
                    kind: utility_kind,
                    t: Box::new(parsed_t),
                })
            }
            UtilityType::KV(utility_kind) => {
                let Some(second_arg) = type_arg.params.get(1) else {
                    return Err(format!(
                        "Found utility type {} without a second type argument",
                        self.name
                    )
                    .into());
                };

                let parsed_k =
                    first_arg.parse_type(semantic, resolver, generics, &[], type_deps)?;
                let parsed_v =
                    second_arg.parse_type(semantic, resolver, generics, &[], type_deps)?;

                Ok(ParsedType::UtilityKV {
                    kind: utility_kind,
                    k: Box::new(parsed_k),
                    v: Box::new(parsed_v),
                })
            }
        }
    }
}
