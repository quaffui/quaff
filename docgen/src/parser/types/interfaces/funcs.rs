use oxc::ast::ast::{PropertyKey, TSSignature};
use oxc_semantic::Semantic;

use crate::{
    extractor::{CommentInfo, Extractor, GenericBindings},
    parser::{ParsedType, StandardType, TypeParser, parse_svelte_props_file},
    prelude::*,
    resolver::{PathResolver, TypeRegistry},
};

use super::{InterfaceProperty, InterfacePropertyKey};

/// Removes explicit `undefined` alternatives and reports property optionality.
fn extract_undefined(parsed_type: ParsedType) -> (ParsedType, bool) {
    match parsed_type {
        ParsedType::Union(types) => {
            let (undefined_types, remaining): (Vec<_>, Vec<_>) = types
                .into_iter()
                .partition(|t| matches!(t, ParsedType::Standard(s) if s.name == "undefined"));

            if !undefined_types.is_empty() {
                let simplified = match remaining.len() {
                    0 => ParsedType::Standard(StandardType::new("undefined".to_string())),
                    1 => remaining.into_iter().next().unwrap(),
                    _ => ParsedType::Union(remaining),
                };

                (simplified, true)
            } else {
                (ParsedType::Union(remaining), false)
            }
        }
        ParsedType::Standard(ref s) if s.name == "undefined" => (parsed_type, true),
        other => (other, false),
    }
}

/// Attaches component defaults before inherited properties undergo filtering or overrides.
pub(super) fn apply_component_defaults(
    interface_name: &str,
    properties: &mut [InterfaceProperty],
    resolver: &PathResolver,
) -> Result<()> {
    let Some(component_name) = interface_name.strip_suffix("Props") else {
        return Ok(());
    };
    let svelte_file = resolver
        .0
        .with_file_name(format!("{component_name}.svelte"));

    if !svelte_file.is_file() {
        return Ok(());
    }

    let defaults = parse_svelte_props_file(&svelte_file)?;

    for property in properties {
        if let InterfacePropertyKey::Identifier(name) = &property.key
            && let Some(default) = defaults.get(name).and_then(|prop| prop.default.as_ref())
        {
            property
                .comment
                .get_or_insert_with(CommentInfo::default)
                .default = Some(default.clone());
        }
    }

    Ok(())
}

/// Parses named properties and index signatures from an interface or type literal.
pub(super) fn parse_members(
    members: &[TSSignature<'_>],
    member_kind: &str,
    semantic: &Semantic,
    resolver: &PathResolver,
    generic_bindings: &GenericBindings,
    registry: &mut TypeRegistry,
) -> Result<Vec<InterfaceProperty>> {
    let mut props = Vec::new();

    for ts_signature in members {
        let prop_key;
        let type_annotation;
        let comment;
        let optional;

        match ts_signature {
            TSSignature::TSPropertySignature(prop) => {
                let PropertyKey::StaticIdentifier(key) = &prop.key else {
                    return Err(format!(
                        "Literal properties must be identifiers. Parsing property: {:?}",
                        prop
                    )
                    .into());
                };

                prop_key = InterfacePropertyKey::Identifier(key.name.to_string());
                comment = key.span.extract(semantic, resolver, registry)?;
                optional = prop.optional;

                let Some(annotation) = &prop.type_annotation else {
                    return Err(format!(
                        "Literal properties must have type annotations. Parsing property: {:#?}",
                        prop
                    )
                    .into());
                };

                type_annotation = annotation.type_annotation.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?;
            }
            TSSignature::TSIndexSignature(prop) => {
                let name = prop.parameter.name.to_string();
                let key_type = prop.parameter.type_annotation.type_annotation.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?;
                let value_type = prop.type_annotation.type_annotation.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?;

                comment = prop.span.extract(semantic, resolver, registry)?;

                let (cleaned_value_type, is_optional) = extract_undefined(value_type);

                prop_key = InterfacePropertyKey::IndexSignature {
                    name,
                    type_annotation: key_type,
                };
                type_annotation = cleaned_value_type;
                optional = is_optional;
            }
            _ => {
                return Err(format!("Unsupported {member_kind} member: {:?}", ts_signature).into());
            }
        }

        let parsed_prop = InterfaceProperty::new(prop_key, type_annotation, optional, comment);
        props.push(parsed_prop);
    }

    Ok(props)
}
