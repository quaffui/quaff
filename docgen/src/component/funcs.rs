use std::{collections::HashMap, path::PathBuf};

use crate::{
    Result,
    extractor::CommentInfo,
    parser::{
        Interface, InterfacePropertyFlags, InterfacePropertyKey, ParsedPropsInterface,
        ParsedSvelteMethods, ParsedSvelteProps, Snippet, TSPropsParser,
        parse_component_description, parse_svelte_file,
    },
    resolver::PathResolver,
    transformer::{QApiPropInfo, ToHtml},
};

use super::{DocgenComponentInput, DocgenComponentOutput, DocgenInterface, QApiGeneric};

/// Parses component sources and combines their TypeScript and Svelte documentation.
pub(crate) fn generate_component(component: DocgenComponentInput) -> Result<DocgenComponentOutput> {
    eprintln!("processing {}", component.props_file.display());
    let props_file = &component.props_file;
    let svelte_files = &component.svelte_files;
    let resolver = PathResolver(props_file);
    let parsed_interfaces = props_file.parse_props(&resolver)?;
    let mut parsed_svelte_files = HashMap::new();
    let mut interfaces = Vec::with_capacity(parsed_interfaces.len());

    for ParsedPropsInterface {
        interface,
        type_definitions,
    } in parsed_interfaces.into_values()
    {
        let svelte_file = resolve_svelte_file(&interface.name, svelte_files)?;

        if !parsed_svelte_files.contains_key(&svelte_file) {
            let (props, methods) = parse_svelte_file(&svelte_file)?;
            parsed_svelte_files.insert(svelte_file.clone(), (props, methods));
        }

        let (svelte_props, svelte_methods) = parsed_svelte_files
            .get(&svelte_file)
            .expect("parsed Svelte file was inserted above");

        let mut docs =
            generate_interface(interface, svelte_props, svelte_methods, type_definitions)?;
        docs.component_name = svelte_file
            .file_stem()
            .and_then(|name| name.to_str())
            .map(str::to_owned);
        docs.description = parse_component_description(&svelte_file)?;
        interfaces.push(docs);
    }

    Ok(DocgenComponentOutput {
        props_file: component.props_file,
        interfaces,
    })
}

/// Matches a props interface to its Svelte source, allowing a single-file fallback.
pub(super) fn resolve_svelte_file(
    interface_name: &str,
    svelte_files: &[PathBuf],
) -> Result<PathBuf> {
    let component_name = interface_name
        .strip_suffix("Props")
        .ok_or_else(|| format!("Expected a *Props interface, found {interface_name}"))?;
    let expected_name = format!("{component_name}.svelte");
    if let Some(path) = svelte_files
        .iter()
        .find(|path| path.file_name().and_then(|name| name.to_str()) == Some(&expected_name))
    {
        return Ok(path.clone());
    }

    if let [path] = svelte_files {
        return Ok(path.clone());
    }

    Err(format!(
        "Could not match {interface_name} to {expected_name}; received {} Svelte candidates",
        svelte_files.len()
    )
    .into())
}

/// Combines parsed API types with Svelte defaults, bindability, and exported methods.
pub(super) fn generate_interface(
    interface: Interface,
    svelte_props: &ParsedSvelteProps,
    svelte_methods: &ParsedSvelteMethods,
    mut type_dependencies: std::collections::BTreeMap<String, String>,
) -> Result<DocgenInterface> {
    let Interface {
        name,
        generics,
        properties,
        dom_props_heritage,
    } = interface;
    let generics = generics
        .into_iter()
        .map(|generic| QApiGeneric {
            name: generic.name,
            constraint: generic.constraint.map(ToHtml::to_html),
            default: generic.default.map(ToHtml::to_html),
        })
        .collect();
    let dom_attributes_constraint = dom_props_heritage.map(|heritage| heritage.to_html());
    let mut props = Vec::new();
    let mut snippets = Vec::new();

    for property in properties {
        let mut property = match Snippet::try_from(property) {
            Ok(snippet) => {
                snippets.push(QApiPropInfo::from(snippet));
                continue;
            }
            Err(property) => property,
        };
        let comment = property.comment.get_or_insert_with(CommentInfo::default);

        comment
            .default
            .get_or_insert_with(|| "undefined".to_string());

        if let InterfacePropertyKey::Identifier(property_name) = &property.key
            && let Some(svelte_prop) = svelte_props.get(property_name)
        {
            if svelte_prop.bindable {
                property.flags |= InterfacePropertyFlags::BINDABLE;
            }

            if let Some(default) = &svelte_prop.default {
                let default = default.clone();
                comment.default = Some(default);
            }
        }

        props.push(QApiPropInfo::try_from(property)?);
    }

    for method in svelte_methods.values() {
        for (type_name, definition) in &method.type_definitions {
            if let Some(existing) = type_dependencies.insert(type_name.clone(), definition.clone())
                && existing != *definition
            {
                return Err(
                    format!("Conflicting type definitions for {type_name} in {name}").into(),
                );
            }
        }
    }

    let mut methods = svelte_methods
        .values()
        .cloned()
        .map(QApiPropInfo::from)
        .collect::<Vec<_>>();
    methods.sort_by(|left, right| left.name.cmp(&right.name));

    props.sort_by(|left, right| left.name.cmp(&right.name));
    snippets.sort_by(|left, right| left.name.cmp(&right.name));

    Ok(DocgenInterface {
        name,
        component_name: None,
        description: None,
        generics,
        dom_attributes_constraint,
        props,
        snippets,
        methods,
        type_dependencies,
    })
}
