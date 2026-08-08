use oxc::ast::ast::{PropertyKey, TSInterfaceDeclaration, TSSignature};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        InterfaceProperty, InterfaceType, ParsedGeneric, ParsedType, PathResolver, TypeDependencies,
    },
    extractor::{extract_generics, extract_prop_comment_info},
    parser::ts_types::parse_type,
    prelude::*,
};

pub fn parse_interface(
    decl: &TSInterfaceDeclaration,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    type_args: &Vec<ParsedType>,
) -> Result<InterfaceType> {
    let name = decl.id.name.to_string();

    let mut generics = Vec::new();

    if let Some(params) = &decl.type_parameters {
        generics = extract_generics(params, type_deps, semantic, resolver)?;
    }

    let properties =
        parse_interface_body(decl, type_deps, semantic, resolver, &generics, &type_args)?;

    Ok(InterfaceType {
        name,
        properties,
        generics,
    })
}

fn parse_interface_body(
    interface: &TSInterfaceDeclaration,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
    type_args: &Vec<ParsedType>,
) -> Result<Vec<InterfaceProperty>> {
    let mut props = Vec::new();

    for ts_signature in &interface.body.body {
        let TSSignature::TSPropertySignature(prop) = ts_signature else {
            return Err(format!(
                "Unsupported interface property signature: {:#?}",
                ts_signature
            )
            .into());
        };

        let PropertyKey::StaticIdentifier(key) = &prop.key else {
            return Err(format!(
                "Interface properties must be identifiers. Parsing property: {:#?}",
                prop
            )
            .into());
        };

        let comment = extract_prop_comment_info(&key.span, semantic)?;

        let prop_name = key.name.to_string();

        let Some(annotation) = &prop.type_annotation else {
            return Err(format!(
                "Interface properties must have type annotations. Parsing property: {:#?}",
                prop
            )
            .into());
        };

        let parsed_type = parse_type(
            &annotation.type_annotation,
            type_deps,
            semantic,
            resolver,
            &generics,
            type_args,
        )?;

        let parsed_prop = InterfaceProperty::new(prop_name, parsed_type, prop.optional, comment)
            .with_type_args(type_args);
        props.push(parsed_prop);
    }

    Ok(props)
}
