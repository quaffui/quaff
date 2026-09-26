use oxc_semantic::Semantic;

use crate::{
    Result,
    parser::ParsedType,
    resolver::{PathResolver, TypeRegistry},
};

use super::GenericBindings;

/// Builds generic scopes for declarations and their concrete instantiations.
pub trait GenericBindingsParser {
    /// Creates bindings that preserve the declaration's generic parameter names.
    fn declaration_bindings(&self) -> GenericBindings;

    /// Maps supplied type arguments to this declaration's parameters, applying defaults for
    /// omitted arguments.
    fn instantiate_bindings(
        &self,
        type_args: &[ParsedType],
        semantic: &Semantic,
        resolver: &PathResolver,
        registry: &mut TypeRegistry,
    ) -> Result<GenericBindings>;
}
