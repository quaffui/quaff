use std::path::PathBuf;

use crate::{
    extractor::comments::CommentInfo,
    parser::{
        TSPropsParser,
        svelte::parse_svelte_file,
        types::{
            interfaces::{InterfacePropertyFlags, InterfacePropertyKey},
            snippets::Snippet,
        },
    },
    resolver::PathResolver,
    transformer::html::{QApiPropInfo, ToHtml},
};

mod constants;
mod extractor;
mod impls;
mod parser;
mod prelude;
mod resolver;
mod traits;
mod transformer;

pub use prelude::{Result, W};
pub use traits::SpanDisplay;

fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    // Get file path from args. Error if no arg provided.
    let args = std::env::args().collect::<Vec<String>>();
    if args.len() < 2 {
        return Err("Please provide a path to the props file.".into());
    }
    let file = PathBuf::from(&args[1]);
    if !file.exists() {
        return Err(format!("File not found: {}", file.display()).into());
    }

    let resolver = PathResolver(&file);

    let parsed_interfaces = file.parse_props(&resolver)?;

    for (name, interface) in parsed_interfaces.into_iter() {
        let svelte_file = file
            .parent()
            .map(|dir| dir.join(name.replace("Props", ".svelte")));

        if svelte_file.as_ref().is_none_or(|file| !file.exists()) {
            println!(
                "Skip parsing defaults for {}: No corresponding Svelte file found",
                name
            );

            continue;
        }

        let api_heritage_header = interface.dom_props_heritage.map(|heritage| {
            format!(
                "interface {} extends {}",
                interface.name.to_string(),
                heritage.to_html(),
            )
        });

        let (mut parsed_svelte_prop, parsed_methods) = parse_svelte_file(&svelte_file.unwrap())?;
        let mut snippets: Vec<Snippet> = Vec::new();

        let mut api_props_info: Vec<QApiPropInfo> = Vec::new();

        for prop in interface.properties.into_iter() {
            let mut prop = match Snippet::try_from(prop) {
                Ok(snippet) => {
                    snippets.push(snippet);
                    continue;
                }
                Err(prop) => prop,
            };

            let InterfacePropertyKey::Identifier(name) = &prop.key else {
                panic!(
                    "Invalid property key, expected Identifier but got an index signature: {:?}",
                    prop
                );
            };

            let prop_comment = prop.comment.get_or_insert(CommentInfo::default());
            if let Some(prop_info) = parsed_svelte_prop.get_mut(name.as_str()) {
                if prop_info.bindable {
                    prop.flags |= InterfacePropertyFlags::Bindable;
                }

                if let Some(new_default) = prop_info.default.take() {
                    prop_comment.default.replace(new_default);
                }
            } else {
                prop_comment.default.get_or_insert("undefined".to_string());
                continue;
            };

            api_props_info.push(QApiPropInfo::from(prop));
        }

        let api_snippets_info: Vec<QApiPropInfo> =
            snippets.into_iter().map(QApiPropInfo::from).collect();
    }

    Ok(())
}
