use std::{collections::HashMap, path::Path};

use oxc::ast::ast::{BindingProperty, Function};

use crate::{
    Result,
    parser::{
        source::{ParseSource, SourceType},
        svelte::{methods::ParsedSvelteMethods, props::ParsedSvelteProps, traits::SvelteParser},
    },
    resolver::PathResolver,
};

/// Function that parses the Svelte file associated with the component currently parsed.
/// It tries to extract the relevant props information (defaults and bindable state)
/// as well as the user-exposed methods defined in the component.
pub fn parse_svelte_file(svelte_file: &Path) -> Result<(ParsedSvelteProps, ParsedSvelteMethods)> {
    let resolver = PathResolver(svelte_file);

    let mut defaults = HashMap::new();
    let mut methods = HashMap::new();

    SourceType::Svelte(svelte_file).parse_source(|node, semantic| {
        if let Some(mut props) = <&[BindingProperty]>::extract(node) {
            defaults.extend(props.parse(semantic, &resolver)?);
        } else if let Some(mut func) = <&Function>::extract(node) {
            let (name, func_type) = func.parse(semantic, &resolver)?;
            methods.insert(name, func_type);
        }

        Ok(false)
    })?;

    Ok((defaults, methods))
}
