use crate::{parser::Interface, resolver::TypeDefinitions};

/// Parsed documentation input for one exported `*Props` interface.
#[derive(Debug)]
pub struct ParsedPropsInterface {
    pub interface: Interface,
    pub type_definitions: TypeDefinitions,
}
