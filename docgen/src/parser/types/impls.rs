use std::{collections::HashMap, str::FromStr};

use oxc::{
    ast::ast::{
        TSArrayType, TSIntersectionType, TSParenthesizedType, TSTupleElement, TSType, TSTypeName,
        TSTypeReference, TSUnionType,
    },
    span::GetSpan,
};
use oxc_semantic::Semantic;

use crate::{
    Result, SpanDisplay,
    extractor::generics::GenericInfo,
    resolver::{PathResolver, ReferenceResolver, ResolvedReference},
    transformer::mapping::TYPE_SRC_MAPPINGS,
};

use super::{
    ExternalType, ParsedType, ReferenceType, StandardType, TypeDependencies, TypeParser,
    UtilityTypeParser,
    interfaces::InterfaceParser,
    ts_utilities::{UtilityKVKind, UtilityTKind, UtilityType},
};

impl StandardType {
    pub fn new(name: String) -> Self {
        Self { name }
    }
}

impl ExternalType {
    pub fn maybe_new(name: String) -> Option<Self> {
        let maybe_src_mapping = TYPE_SRC_MAPPINGS.iter().find(|m| m.matches(&name));

        if let Some(src_mapping) = maybe_src_mapping {
            let (type_name, type_src) = src_mapping.map(&name);

            return Some(Self {
                name: type_name,
                type_src,
            });
        }

        None
    }
}

impl IntoIterator for ParsedType {
    type Item = Self;

    type IntoIter = std::vec::IntoIter<Self>;

    fn into_iter(self) -> Self::IntoIter {
        match self {
            Self::Union(types) | Self::Intersection(types) => types.into_iter(),
            _ => panic!("Called into_iter() on a non-union/non-intersection ParsedType"),
        }
    }
}

impl TypeParser for TSParenthesizedType<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> crate::Result<ParsedType> {
        self.type_annotation
            .parse_type(semantic, resolver, generics, type_arg, type_deps)
    }
}

impl TypeParser for TSUnionType<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> crate::Result<ParsedType> {
        let parsed = self
            .types
            .iter()
            .map(|t| t.parse_type(semantic, resolver, generics, type_arg, type_deps))
            .collect::<Result<Vec<ParsedType>>>()?;
        return Ok(ParsedType::Union(parsed));
    }
}

impl TypeParser for TSIntersectionType<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> crate::Result<ParsedType> {
        let parsed = self
            .types
            .iter()
            .map(|t| t.parse_type(semantic, resolver, generics, type_arg, type_deps))
            .collect::<Result<Vec<ParsedType>>>()?;
        return Ok(ParsedType::Intersection(parsed));
    }
}

impl TypeParser for TSArrayType<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType> {
        let parsed = self
            .element_type
            .parse_type(semantic, resolver, generics, type_arg, type_deps)?;
        Ok(ParsedType::UtilityT {
            kind: UtilityTKind::Array,
            t: Box::new(parsed),
        })
    }
}

impl TypeParser for TSTypeReference<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType> {
        let TSTypeName::IdentifierReference(ident) = &self.type_name else {
            return Err(format!("Unsupported type name: {:?}", self.type_name).into());
        };

        // This allows to check for utility types.
        if let Ok(utility_kind) = UtilityTKind::from_str(&ident.name) {
            return ident.parse_utility_type(
                UtilityType::T(utility_kind),
                self,
                semantic,
                resolver,
                generics,
                type_deps,
            );
        } else if let Ok(utility_kind) = UtilityKVKind::from_str(&ident.name) {
            return ident.parse_utility_type(
                UtilityType::KV(utility_kind),
                self,
                semantic,
                resolver,
                generics,
                type_deps,
            );
        };

        // This allows to check for external types like `HTMLAttributes<...>`.
        let whole_name = self.span.display(semantic);
        if let Some(external) = ExternalType::maybe_new(whole_name) {
            return Ok(ParsedType::External(external));
        }

        // This allow to check for snippets
        if ident.name == "Snippet" {
            let mut snippet_args = None;

            if let Some(args) = &self.type_arguments {
                let Some(TSType::TSTupleType(inner)) = &args.params.get(0) else {
                    return Err(format!(
                        "Invalid snippet type parameter: {:?}",
                        args.params.get(0)
                    )
                    .into());
                };

                let Some(TSTupleElement::TSTypeLiteral(literal)) = &inner.element_types.get(0)
                else {
                    return Err(format!(
                        "Expected a type literal for snippet type arguments but got: {:?}",
                        inner.element_types.get(0)
                    )
                    .into());
                };

                let parsed: HashMap<String, ParsedType> = literal
                    .parse_body(semantic, resolver, generics, type_arg, type_deps)?
                    .into_iter()
                    .map(|prop| (prop.name, prop.type_annotation))
                    .collect();

                snippet_args = Some(parsed);
            }

            return Ok(ParsedType::Snippet(snippet_args.unwrap_or_default()));
        }

        let mut reference_type = None;

        ident.resolve(semantic, resolver, &mut |resolved, scope_resolver| {
            reference_type = Some(ReferenceType {
                name: ident.name.to_string(),
                parsed: Box::new(ParsedType::Standard(StandardType {
                    name: "".to_string(),
                })),
            });

            match resolved {
                ResolvedReference::VariableDeclarator(..) => {
                    return Err(format!(
                        "Type declarations must be types, not variables. Parsing: {:?}",
                        resolved
                    )
                    .into());
                }
                ResolvedReference::TSTypeAliasDeclaration(decl, semantic) => {
                    *reference_type.as_mut().unwrap().parsed = decl.type_annotation.parse_type(
                        semantic,
                        scope_resolver,
                        generics,
                        type_arg,
                        type_deps,
                    )?;
                }
                ResolvedReference::TSInterfaceDeclaration(decl, semantic) => {
                    *reference_type.as_mut().unwrap().parsed = ParsedType::Interface(decl.parse(
                        semantic,
                        scope_resolver,
                        type_arg,
                        type_deps,
                    )?);
                }
            }

            Ok(())
        })?;

        let parsed_type = if let Some(ref_type) = reference_type {
            ParsedType::Reference(ref_type)
        } else {
            ParsedType::Standard(StandardType::new(ident.to_string()))
        };

        Ok(parsed_type)
    }
}

impl TypeParser for TSType<'_> {
    fn parse_type(
        &self,
        semantic: &oxc_semantic::Semantic,
        resolver: &crate::resolver::PathResolver,
        generics: &[crate::extractor::generics::GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType> {
        match self {
            Self::TSParenthesizedType(union) => {
                union.parse_type(semantic, resolver, generics, type_arg, type_deps)
            }
            Self::TSUnionType(union) => {
                union.parse_type(semantic, resolver, generics, type_arg, type_deps)
            }
            Self::TSIntersectionType(intersection) => {
                intersection.parse_type(semantic, resolver, generics, type_arg, type_deps)
            }
            Self::TSFunctionType(func) => {
                func.parse_type(semantic, resolver, generics, type_arg, type_deps)
            }
            Self::TSTypeLiteral(literal) => literal
                .parse_body(semantic, resolver, generics, type_arg, type_deps)
                .map(ParsedType::TypeLiteral),
            Self::TSArrayType(arr) => {
                arr.parse_type(semantic, resolver, generics, type_arg, type_deps)
            }
            Self::TSTypeReference(reference) => {
                reference.parse_type(semantic, resolver, generics, type_arg, type_deps)
            }
            _ => {
                let def = self.span().display(semantic);
                Ok(ParsedType::Standard(StandardType::new(def)))
            }
        }
    }
}
