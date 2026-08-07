use oxc::{
    ast::ast::{
        BindingPattern, PropertyKey, TSFunctionType, TSSignature, TSType, TSTypeLiteral, TSTypeName,
    },
    span::GetSpan,
};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        ExternalType, FunctionType, FunctionTypeParam, InterfaceProperty, ParsedGeneric,
        ParsedType, PathResolver, ResolvedReference, StandardType, TypeDependencies,
    },
    extractor::extract_generics,
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
) -> Result<ParsedType> {
    match ts_type {
        TSType::TSUnionType(union) => {
            let parsed = union
                .types
                .iter()
                .map(|t| parse_type(t, type_deps, semantic, resolver, generics))
                .collect::<Result<Vec<ParsedType>>>()?;
            return Ok(ParsedType::Union(parsed));
        }
        TSType::TSIntersectionType(intersection) => {
            let parsed = intersection
                .types
                .iter()
                .map(|t| parse_type(t, type_deps, semantic, resolver, generics))
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
        TSType::TSTypeReference(reference) => {
            let TSTypeName::IdentifierReference(ident) = &reference.type_name else {
                return Err(format!("Unsupported type name: {:#?}", reference.type_name).into());
            };

            // This allows to check for external types like `HTMLAttributes<...>`.
            let whole_name = reference.span().display(semantic);
            if let Some(external) = ExternalType::maybe_new(whole_name) {
                return Ok(ParsedType::External(external));
            }

            let mut parsed_type = ParsedType::Standard(StandardType::new(ident.to_string()));

            resolve_reference(ident, semantic, resolver, |resolved| {
                match resolved {
                    ResolvedReference::VariableDeclarator(..) => {}
                    ResolvedReference::TSTypeAliasDeclaration(decl, semantic) => {
                        parsed_type = parse_type(
                            &decl.type_annotation,
                            type_deps,
                            semantic,
                            resolver,
                            generics,
                        )?;
                    }
                    ResolvedReference::TSInterfaceDeclaration(decl, semantic) => {
                        parsed_type = ParsedType::Interface(parse_interface(
                            decl, type_deps, semantic, resolver,
                        )?);
                    }
                }

                Ok(())
            })?;

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
    )?;

    let mut params = Vec::new();

    for param in &fn_type.params.items {
        let Some(annotation) = &param.type_annotation else {
            return Err(format!(
                "Parameters in function types must have type annotations. Parsing function type: {:#?}",
                fn_type
            )
            .into());
        };

        let BindingPattern::BindingIdentifier(ident) = &param.pattern else {
            return Err(format!("Parameters that are not identifiers are not currently supported. Parsing parameter: {:#?}", param).into());
        };

        let parsed = parse_type(
            &annotation.type_annotation,
            type_deps,
            semantic,
            resolver,
            &all_generics,
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
            return Err(format!("Unsupported literal member: {:#?}", prop).into());
        };

        let PropertyKey::StaticIdentifier(key) = &prop.key else {
            return Err(format!(
                "Literal properties must be identifiers. Parsing property: {:#?}",
                prop
            )
            .into());
        };

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
        )?;

        props.push(InterfaceProperty {
            name: prop_name,
            type_annotation: parsed_type,
            optional: prop.optional,
        });
    }

    Ok(props)
}
