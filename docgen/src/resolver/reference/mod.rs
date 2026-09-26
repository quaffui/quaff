mod funcs;
mod impls;
mod models;
mod traits;

pub use models::ResolvedReference;
pub use traits::{ReferenceNodeMatcher, ReferenceResolver};

#[cfg(test)]
mod tests;
