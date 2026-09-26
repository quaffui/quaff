mod description;
mod funcs;
mod methods;
mod props;
#[cfg(test)]
mod tests;
mod traits;

pub use description::*;
pub use funcs::parse_svelte_file;
pub use methods::*;
pub use props::*;
pub use traits::*;
