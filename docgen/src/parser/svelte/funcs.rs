use std::{collections::HashMap, path::Path};

use oxc::ast::ast::BindingProperty;

use crate::{
    Result,
    parser::{
        ExportedMethod, ParseSource, ParsedSvelteMethods, ParsedSvelteProps, SourceType,
        SvelteParser,
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
        } else {
            for method in ExportedMethod::extract(node, semantic) {
                let (name, method_info) = method.parse(semantic, &resolver)?;
                methods.insert(name, method_info);
            }
        }

        Ok(false)
    })?;

    Ok((defaults, methods))
}
