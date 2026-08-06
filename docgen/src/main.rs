use std::path::PathBuf;

use crate::{defs::PathResolver, parse_svelte::parse_svelte_file, parser::parse_props_interfaces};

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

    // let parsed_defaults = parse_svelte_file(&file)?;

    Ok(())
}
