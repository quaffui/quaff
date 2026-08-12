use oxc::ast::ast::TSTypeParameterDeclaration;
use oxc_semantic::Semantic;

use crate::{
    Result,
    parser::types::ParsedType,
    resolver::{PathResolver, dependency::TypeRegistry},
};

use super::GenericBindings;

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

impl GenericBindingsParser for &TSTypeParameterDeclaration<'_> {
    fn declaration_bindings(&self) -> GenericBindings {
        (*self).declaration_bindings()
    }

    fn instantiate_bindings(
        &self,
        type_args: &[ParsedType],
        semantic: &Semantic,
        resolver: &PathResolver,
        registry: &mut TypeRegistry,
    ) -> Result<GenericBindings> {
        (*self).instantiate_bindings(type_args, semantic, resolver, registry)
    }
}
