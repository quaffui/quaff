use std::{collections::HashMap, path::Path};

use oxc::ast::{
    AstKind,
    ast::{
        BindingPattern, Declaration, TSFunctionType, TSInterfaceDeclaration, TSType, TSTypeName,
    },
};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        FunctionType, FunctionTypeParam, ParsedGeneric, ParsedInterface, ParsedType, PathResolver,
        ResolvedReference, StandardType, TypeDependencies,
    },
    extractor::extract_generics,
    parser::parse_ts_file,
    prelude::Result,
    resolver::resolve_reference,
};

pub fn parse_props_interfaces(
    path: &Path,
    resolver: &PathResolver,
) -> Result<HashMap<String, ParsedInterface>> {
    let mut parsed_interfaces = HashMap::new();

    parse_ts_file(path, |node, semantic, _program| {
        if let AstKind::ExportDeclaration(export) = node.kind()
            && let Declaration::TSInterfaceDeclaration(interface) = &export.declaration
            && interface.id.name.ends_with("Props")
        {
            let name = interface.id.name.to_string();
            let mut type_deps: TypeDependencies = HashMap::new();

            let generics = interface
                .type_parameters
                .as_ref()
                .map(|decl| extract_generics(decl, &mut type_deps, semantic, resolver))
                .transpose()?;
        }

        Ok(false)
    })?;

    Ok(parsed_interfaces)
}

pub fn parse_type(
    ts_type: &TSType,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
) -> Result<ParsedType> {
    if let TSType::TSUnionType(union) = ts_type {
        let parsed = union
            .types
            .iter()
            .map(|t| parse_type(t, type_deps, semantic, resolver, generics))
            .collect::<Result<Vec<ParsedType>>>()?;
        return Ok(ParsedType::Union(parsed));
    }

    if let TSType::TSIntersectionType(intersection) = ts_type {
        let parsed = intersection
            .types
            .iter()
            .map(|t| parse_type(t, type_deps, semantic, resolver, generics))
            .collect::<Result<Vec<ParsedType>>>()?;

        return Ok(ParsedType::Intersection(parsed));
    }

    if let TSType::TSFunctionType(func) = ts_type {
        let parsed = parse_fn_type(func, type_deps, semantic, resolver, generics)?;
        return Ok(ParsedType::Function(Box::new(parsed)));
    }

    if let TSType::TSTypeReference(reference) = ts_type {
        let TSTypeName::IdentifierReference(ident) = &reference.type_name else {
            return Err(format!("Unsupported type name: {:#?}", reference.type_name).into());
        };

        let name = ident.name.to_string();
        let mut parsed_type = ParsedType::Standard(StandardType::new(ident.to_string()));

        resolve_reference(ident, semantic, resolver, |resolved| {
            match resolved {
                ResolvedReference::VariableDeclarator(..) => return Ok(()),
                ResolvedReference::TSTypeAliasDeclaration(decl, semantic) => {
                    parsed_type = parse_type(
                        &decl.type_annotation,
                        type_deps,
                        semantic,
                        resolver,
                        generics,
                    )?;
                }
                ResolvedReference::TSInterfaceDeclaration(decl, semantic) => {}
            }

            Ok(())
        })?;
    }

    Ok(todo!())
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
        .transpose()?;

    let mut all_generics = generics.to_vec();

    if let Some(fg) = &fn_generics {
        all_generics.extend(fg.iter().cloned());
    }

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

pub fn parse_interface(
    decl: &TSInterfaceDeclaration,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<HashMap<String, ParsedType>> {
    let name = decl.id.name.to_string();

    Ok(todo!())
}
