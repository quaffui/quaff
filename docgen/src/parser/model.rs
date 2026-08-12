use crate::{parser::types::interfaces::Interface, resolver::dependency::TypeDefinitions};

/// Parsed documentation input for one exported `*Props` interface.
#[derive(Debug)]
pub struct ParsedPropsInterface {
    pub interface: Interface,
    pub type_definitions: TypeDefinitions,
}
