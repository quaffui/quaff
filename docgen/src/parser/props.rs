use std::{collections::HashMap, path::Path};

use oxc::ast::{
    AstKind,
    ast::{Declaration, PropertyKey, TSInterfaceDeclaration, TSSignature},
};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        ParsedGeneric, ParsedProp, ParsedPropertyFlags, ParsedProps, ParsedPropsInterface,
        PathResolver, TypeDependencies,
    },
    extractor::{extract_generics, extract_prop_comment_info},
    parser::{heritage::parse_heritage, parse_ts_file, ts_types::parse_type},
    prelude::*,
};

pub fn parse_props_interfaces(
    path: &Path,
    resolver: &PathResolver,
) -> Result<HashMap<String, ParsedPropsInterface>> {
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
                .transpose()?
                .unwrap_or_default();

            let mut parsed_heritage =
                parse_heritage(&interface.extends, &mut type_deps, semantic, resolver)?;

            let own_props = parse_props_interface_body(
                interface,
                &mut type_deps,
                semantic,
                resolver,
                &generics,
            )?;

            parsed_heritage.herited_props.extend(own_props);

            let parsed_interface = ParsedPropsInterface {
                type_dependencies: type_deps,
                generics,
                properties: parsed_heritage.herited_props,
                dom_attrs_heritage: parsed_heritage.dom,
            };

            parsed_interfaces.insert(name, parsed_interface);
        }

        Ok(false)
    })?;

    Ok(parsed_interfaces)
}

fn parse_props_interface_body(
    interface: &TSInterfaceDeclaration,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
    generics: &[ParsedGeneric],
) -> Result<ParsedProps> {
    let mut props = HashMap::new();

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

        let name = key.name.to_string();

        let parsed_comment = extract_prop_comment_info(&key.span, semantic)?;
        let mut description = "No description provided".to_string();
        let mut default = None;

        if let Some(comment) = parsed_comment {
            description = comment.description;
            default = comment.default;
        }

        let Some(annotation) = &prop.type_annotation else {
            return Err(format!(
                "Interface properties must have type annotations. Parsing property: {:#?}",
                prop
            )
            .into());
        };

        let type_def = parse_type(
            &annotation.type_annotation,
            type_deps,
            semantic,
            resolver,
            &generics,
            &vec![],
        )?;

        let mut flags = ParsedPropertyFlags::None;
        if prop.optional {
            flags |= ParsedPropertyFlags::Optional;
        }

        let parsed = ParsedProp {
            name,
            description,
            flags,
            type_def,
            default,
        };

        props.insert(parsed.name.clone(), parsed);
    }

    Ok(props)
}
