use std::collections::HashMap;

use crate::parser::types::functions::FunctionType;

/// Information about a parsed Svelte component method.
#[derive(Debug, Clone)]
pub struct MethodInfo {
    /// The name of the method.
    pub name: String,
    /// The function's type definition.
    pub function_type: FunctionType,
    /// The trusted JSDoc description of the method.
    pub description: String,
}

/// Parsed Svelte component methods.
/// It's a map of the method name to its method information.
pub type ParsedSvelteMethods = HashMap<String, MethodInfo>;
