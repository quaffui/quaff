mod impls;
mod model;
mod traits;

pub use model::SourceType;
pub use traits::ParseSource;

pub(crate) use impls::extract_svelte_scripts;
