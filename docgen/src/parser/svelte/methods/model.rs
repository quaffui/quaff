use std::collections::HashMap;

use oxc::{
    ast::ast::{FormalParameters, TSTypeAnnotation, TSTypeParameterDeclaration},
    span::Span,
};

use crate::{parser::types::functions::FunctionType, resolver::dependency::TypeDefinitions};

/// Information about a parsed Svelte component method.
#[derive(Debug, Clone)]
pub struct MethodInfo {
    /// The name of the method.
    pub name: String,
    /// The function's type definition.
    pub function_type: FunctionType,
    /// The trusted JSDoc description of the method.
    pub description: String,
    /// Definitions referenced by parameter and return types.
    pub type_definitions: TypeDefinitions,
}

/// Parsed Svelte component methods.
/// It's a map of the method name to its method information.
pub type ParsedSvelteMethods = HashMap<String, MethodInfo>;

/// Shared signature of a function declaration or exported arrow method.
pub struct ExportedMethod<'a> {
    pub(super) name: &'a str,
    pub(super) params: &'a FormalParameters<'a>,
    pub(super) type_parameters: Option<&'a TSTypeParameterDeclaration<'a>>,
    pub(super) return_type: Option<&'a TSTypeAnnotation<'a>>,
    pub(super) span: Span,
    pub(super) export_span: Span,
}
