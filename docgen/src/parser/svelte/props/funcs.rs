use std::{collections::HashMap, path::Path};

use oxc::ast::ast::BindingProperty;

use crate::{
    Result,
    parser::{ParseSource, SourceType, SvelteParser},
    resolver::PathResolver,
};

use super::ParsedSvelteProps;

/// Reads defaults without parsing methods, whose parameter types may refer back to props.
pub fn parse_svelte_props_file(svelte_file: &Path) -> Result<ParsedSvelteProps> {
    let resolver = PathResolver(svelte_file);
    let mut props = HashMap::new();

    SourceType::Svelte(svelte_file).parse_source(|node, semantic| {
        if let Some(mut bindings) = <&[BindingProperty]>::extract(node) {
            props.extend(bindings.parse(semantic, &resolver)?);
        }

        Ok(false)
    })?;

    Ok(props)
}
