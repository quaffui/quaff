use std::collections::HashMap;

use crate::parser::types::functions::FunctionType;

/// Parsed Svelte component methods.
/// It's a map of the method name to its type definition.
pub type ParsedSvelteMethods = HashMap<String, FunctionType>;
