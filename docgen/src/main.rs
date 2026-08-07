use std::path::PathBuf;

use crate::{
    defs::{ParsedPropertyFlags, PathResolver},
    parse_svelte::parse_svelte_file,
    parser::parse_props_interfaces,
};

mod defs;
mod extractor;
mod parse_svelte;
mod parser;
mod prelude;
mod resolver;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let file = PathBuf::from(
        "src/lib/components/tooltip/props.ts",
    );

    let resolver = PathResolver(&file);

    let parsed_interfaces = parse_props_interfaces(&file, &resolver)?;

    for (name, interface) in parsed_interfaces {
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

        let parsed_defaults = parse_svelte_file(&svelte_file.unwrap())?;

        for (_prop_name, mut prop) in interface.properties.into_iter() {
            if let Some(prop_default) = parsed_defaults.get(&prop.name) {
                if prop_default.is_bindable() {
                    prop.flags |= ParsedPropertyFlags::Bindable;
                }

                prop.default.replace(prop_default.value());
            } else {
                prop.default.get_or_insert("undefined".to_string());
                continue;
            };
        }
    }

    Ok(())
}
