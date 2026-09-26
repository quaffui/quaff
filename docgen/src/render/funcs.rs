use std::{
    cmp::Reverse,
    collections::{BTreeMap, BTreeSet},
};

use serde_json::to_string as json;

use crate::{Result, component::DocgenComponentOutput, output::OutputFile};

/// Formats shared type definitions once, then renders each component output.
pub fn render(
    components: Vec<(DocgenComponentOutput, String)>,
    format: &mut impl FnMut(Vec<String>, bool) -> Result<Vec<String>>,
) -> Result<Vec<OutputFile>> {
    let definitions = components
        .iter()
        .flat_map(|(component, _)| &component.interfaces)
        .flat_map(|interface| interface.type_dependencies.values().cloned())
        .collect::<BTreeSet<_>>();

    let sources = definitions.into_iter().collect::<Vec<_>>();
    let formatted = format_batch(sources.clone(), true, format)?;
    let definitions = sources.into_iter().zip(formatted).collect();

    let mut outputs = components
        .into_iter()
        .map(|(component, hash)| {
            let destination = component.props_file.with_file_name("docs.ts");
            let contents = render_component(component, &hash, &definitions)?;

            Ok(OutputFile {
                destination,
                contents,
            })
        })
        .collect::<Result<Vec<_>>>()?;
    let sources = outputs
        .iter_mut()
        .map(|output| std::mem::take(&mut output.contents))
        .collect();

    for (output, contents) in outputs
        .iter_mut()
        .zip(format_batch(sources, false, format)?)
    {
        output.contents = contents;
    }

    Ok(outputs)
}

/// Formats a nonempty batch and rejects an incomplete formatter response.
fn format_batch(
    sources: Vec<String>,
    can_fallback: bool,
    format: &mut impl FnMut(Vec<String>, bool) -> Result<Vec<String>>,
) -> Result<Vec<String>> {
    if sources.is_empty() {
        return Ok(Vec::new());
    }

    let count = sources.len();
    let formatted = format(sources, can_fallback)?;

    if formatted.len() != count {
        return Err("Prettier returned an unexpected number of formatted sources".into());
    }

    Ok(formatted)
}

/// Serializes component metadata into the established TypeScript docs format.
fn render_component(
    mut component: DocgenComponentOutput,
    hash: &str,
    definitions: &BTreeMap<String, String>,
) -> Result<String> {
    if component.interfaces.is_empty() {
        return Err(format!(
            "No props interfaces found for {}",
            component.props_file.display()
        )
        .into());
    }

    // Match localeCompare for the ASCII identifiers accepted by generated exports.
    component.interfaces.sort_by_cached_key(|interface| {
        let primary = interface
            .name
            .bytes()
            .map(|byte| match byte {
                b'_' => 0,
                b'$' => 1,
                _ => byte.to_ascii_lowercase(),
            })
            .collect::<Vec<_>>();

        (primary, Reverse(interface.name.clone()))
    });
    let mut source = format!(
        "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE\n\n// @quaffHash {hash}\n\nimport type {{ QComponentDocs }} from \"$docs\";\n\n"
    );

    for interface in component.interfaces {
        let name = interface
            .name
            .strip_suffix("Props")
            // The parser already validated identifier syntax; keep the existing ASCII export policy.
            .filter(|name| !name.is_empty() && name.is_ascii())
            .ok_or_else(|| {
                format!(
                    "Cannot render invalid props interface name: {}",
                    interface.name
                )
            })?;

        let component_name = match interface.component_name.as_deref() {
            Some(component_name) if !component_name.is_empty() && component_name != name => {
                format!("componentName: {},", json(component_name)?)
            }
            _ => String::new(),
        };
        let dependencies = interface
            .type_dependencies
            .iter()
            .map(|(name, definition)| (name, &definitions[definition]))
            .collect::<Vec<_>>();
        let dom = interface
            .dom_attributes_constraint
            .as_ref()
            .map(json)
            .transpose()?
            .unwrap_or_else(|| "undefined".to_string());
        source.push_str(&format!(
            "export const {name}Docs: QComponentDocs = {{\nname: {},\n{component_name}\ndescription: {},\ndocs: {{\ngenerics: {},\ndomAttributesConstraint: {dom},\nprops: {},\nsnippets: {},\nmethods: {},\ntypeDependencies: Object.fromEntries({}),\n}},\n}};\n\n",
            json(name)?, json(&interface.description.unwrap_or_default())?,
            json(&interface.generics)?, json(&interface.props)?, json(&interface.snippets)?,
            json(&interface.methods)?, json(&dependencies)?,
        ));
    }

    Ok(source)
}
