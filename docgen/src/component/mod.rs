mod impls;
mod model;

pub(crate) use impls::generate_component;
pub(crate) use model::{DocgenComponentInput, DocgenComponentOutput};

#[cfg(test)]
pub(crate) use model::DocgenInterface;
