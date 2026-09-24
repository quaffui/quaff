mod description;
mod main;
mod methods;
mod props;
mod traits;

pub use description::parse_component_description;
pub use main::*;
pub use methods::*;
#[cfg(test)]
pub use props::ParsedSvelteProp;
pub use props::{ParsedSvelteProps, parse_svelte_props_file};
