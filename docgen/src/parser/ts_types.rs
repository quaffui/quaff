use std::str::FromStr;

use oxc::{
    ast::ast::{
        BindingPattern, IdentifierReference, PropertyKey, TSFunctionType, TSSignature, TSType,
        TSTypeLiteral, TSTypeName, TSTypeReference,
    },
    span::GetSpan,
};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        ExternalType, FunctionType, FunctionTypeParam, InterfaceProperty, ParsedGeneric,
        ParsedType, PathResolver, ReferenceType, ResolvedReference, StandardType, TypeDependencies,
        UtilityKVKind, UtilityTKind,
    },
    extractor::{extract_generics, extract_prop_comment_info},
    parser::interfaces::parse_interface,
    prelude::*,
    resolver::resolve_reference,
};

pub fn parse_type(
    ts_type: &TSType,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
    type_arg: &Vec<ParsedType>,
) -> Result<ParsedType> {
    match ts_type {
        TSType::TSParenthesizedType(p_type) => parse_type(
            &p_type.type_annotation,
            type_deps,
            semantic,
            resolver,
            generics,
            type_arg,
        ),
        TSType::TSUnionType(union) => {
            let parsed = union
                .types
                .iter()
                .map(|t| parse_type(t, type_deps, semantic, resolver, generics, type_arg))
                .collect::<Result<Vec<ParsedType>>>()?;
            return Ok(ParsedType::Union(parsed));
        }
        TSType::TSIntersectionType(intersection) => {
            let parsed = intersection
                .types
                .iter()
                .map(|t| parse_type(t, type_deps, semantic, resolver, generics, type_arg))
                .collect::<Result<Vec<ParsedType>>>()?;

            return Ok(ParsedType::Intersection(parsed));
        }
        TSType::TSFunctionType(func) => {
            let parsed = parse_fn_type(func, type_deps, semantic, resolver, generics)?;
            return Ok(ParsedType::Function(Box::new(parsed)));
        }
        TSType::TSTypeLiteral(literal) => {
            let parsed = parse_ts_literal(literal, type_deps, semantic, resolver)?;
            return Ok(ParsedType::TypeLiteral(parsed));
        }
        TSType::TSArrayType(arr) => {
            let parsed = parse_type(
                &arr.element_type,
                type_deps,
                semantic,
                resolver,
                generics,
                type_arg,
            )?;
            return Ok(ParsedType::UtilityT {
                kind: UtilityTKind::Array,
                t: Box::new(parsed),
            });
        }
        TSType::TSTypeReference(reference) => {
            let TSTypeName::IdentifierReference(ident) = &reference.type_name else {
                return Err(format!("Unsupported type name: {:?}", reference.type_name).into());
            };

            // This allows to check for utility types.
            if let Ok(utility_kind) = UtilityTKind::from_str(&ident.name) {
                return parse_utility_t_kind(
                    ident,
                    reference,
                    utility_kind,
                    type_deps,
                    semantic,
                    resolver,
                    generics,
                );
            } else if let Ok(utility_kind) = UtilityKVKind::from_str(&ident.name) {
                return parse_utility_kv_kind(
                    ident,
                    reference,
                    utility_kind,
                    type_deps,
                    semantic,
                    resolver,
                    generics,
                );
            }

            // This allows to check for external types like `HTMLAttributes<...>`.
            let whole_name = reference.span().display(semantic);
            if let Some(external) = ExternalType::maybe_new(whole_name) {
                return Ok(ParsedType::External(external));
            }

            let mut complex_type = None;

            resolve_reference(ident, semantic, resolver, |resolved| {
                complex_type = Some(ReferenceType {
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
                        *complex_type.as_mut().unwrap().parsed = parse_type(
                            &decl.type_annotation,
                            type_deps,
                            semantic,
                            resolver,
                            generics,
                            type_arg,
                        )?;
                    }
                    ResolvedReference::TSInterfaceDeclaration(decl, semantic) => {
                        *complex_type.as_mut().unwrap().parsed = ParsedType::Interface(
                            parse_interface(decl, type_deps, semantic, resolver, type_arg)?,
                        );
                    }
                }

                Ok(())
            })?;

            let parsed_type = if let Some(complex_type) = complex_type {
                ParsedType::Reference(complex_type)
            } else {
                ParsedType::Standard(StandardType::new(ident.to_string()))
            };

            Ok(parsed_type)
        }
        _ => {
            let def = ts_type.span().display(semantic);
            return Ok(ParsedType::Standard(StandardType::new(def)));
        }
    }
}

pub fn parse_fn_type(
    fn_type: &TSFunctionType,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
) -> Result<FunctionType> {
    let fn_generics = fn_type
        .type_parameters
        .as_ref()
        .map(|params| extract_generics(params, type_deps, semantic, resolver))
        .transpose()?
        .unwrap_or_default();

    let all_generics = [generics.to_vec(), fn_generics.clone()].concat();

    let return_type = parse_type(
        &fn_type.return_type.type_annotation,
        type_deps,
        semantic,
        resolver,
        &all_generics,
        &vec![],
    )?;

    let mut params = Vec::new();

    for param in &fn_type.params.items {
        let Some(annotation) = &param.type_annotation else {
            return Err(format!(
                "Parameters in function types must have type annotations. Parsing function type: {:?}",
                fn_type
            )
            .into());
        };

        let BindingPattern::BindingIdentifier(ident) = &param.pattern else {
            return Err(format!("Parameters that are not identifiers are not currently supported. Parsing parameter: {:?}", param).into());
        };

        let parsed = parse_type(
            &annotation.type_annotation,
            type_deps,
            semantic,
            resolver,
            &all_generics,
            &vec![],
        )?;

        params.push(FunctionTypeParam {
            name: ident.name.to_string(),
            type_annotation: parsed,
            optional: param.optional,
        })
    }

    Ok(FunctionType {
        params,
        return_type,
        generics: fn_generics,
    })
}

pub fn parse_ts_literal(
    literal: &TSTypeLiteral,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<Vec<InterfaceProperty>> {
    let mut props = Vec::new();

    for prop in &literal.members {
        let TSSignature::TSPropertySignature(prop) = prop else {
            return Err(format!("Unsupported literal member: {:?}", prop).into());
        };

        let PropertyKey::StaticIdentifier(key) = &prop.key else {
            return Err(format!(
                "Literal properties must be identifiers. Parsing property: {:?}",
                prop
            )
            .into());
        };

        let comment = extract_prop_comment_info(&key.span, semantic)?;

        let prop_name = key.name.to_string();

        let Some(annotation) = &prop.type_annotation else {
            return Err(format!(
                "Literal properties must have type annotations. Parsing property: {:#?}",
                prop
            )
            .into());
        };

        let parsed_type = parse_type(
            &annotation.type_annotation,
            type_deps,
            semantic,
            resolver,
            &Vec::new(),
            &vec![],
        )?;

        let parsed_prop = InterfaceProperty::new(prop_name, parsed_type, prop.optional, comment);
        props.push(parsed_prop);
    }

    Ok(props)
}

fn parse_utility_t_kind(
    ident: &IdentifierReference,
    reference: &TSTypeReference,
    utility_kind: UtilityTKind,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
) -> Result<ParsedType> {
    let Some(type_arg) = &reference.type_arguments else {
        return Err(format!("Found utility type {} without a type argument", ident.name).into());
    };

    let Some(first_arg) = type_arg.params.first() else {
        return Err(format!("Found utility type {} without a type argument", ident.name).into());
    };

    let parsed_arg = parse_type(first_arg, type_deps, semantic, resolver, generics, &vec![])?;

    Ok(ParsedType::UtilityT {
        kind: utility_kind,
        t: Box::new(parsed_arg),
    })
}

fn parse_utility_kv_kind(
    ident: &IdentifierReference,
    reference: &TSTypeReference,
    utility_kind: UtilityKVKind,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
) -> Result<ParsedType> {
    let Some(type_arg) = &reference.type_arguments else {
        return Err(format!("Found utility type {} without a type argument", ident.name).into());
    };

    let Some(first_arg) = type_arg.params.first() else {
        return Err(format!("Found utility type {} without a type argument", ident.name).into());
    };
    let Some(second_arg) = type_arg.params.get(1) else {
        return Err(format!(
            "Found utility type {} without a second type argument",
            ident.name
        )
        .into());
    };

    let parsed_k = parse_type(first_arg, type_deps, semantic, resolver, generics, &vec![])?;
    let parsed_v = parse_type(second_arg, type_deps, semantic, resolver, generics, &vec![])?;

    Ok(ParsedType::UtilityKV {
        kind: utility_kind,
        k: Box::new(parsed_k),
        v: Box::new(parsed_v),
    })
}
