use oxc_semantic::Semantic;

use crate::{
    extractor::GenericBindings,
    prelude::*,
    resolver::{PathResolver, TypeRegistry},
};

use super::{Interface, InterfaceProperty};

/// Trait for parsing an interface from a type.
pub trait InterfaceParser {
    /// Parses an interface from a type.
    fn parse(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<Interface> {
        let _ = semantic;
        let _ = resolver;
        let _ = generic_bindings;
        let _ = registry;
        Err("This optional trait method should not be used if not implemented.".into())
    }

    /// Parses an interface or type literal body into documentation properties.
    fn parse_body(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<Vec<InterfaceProperty>>;
}
