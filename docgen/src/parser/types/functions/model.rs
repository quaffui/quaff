use crate::{extractor::generics::GenericInfo, parser::types::ParsedType};

/// Represents a function parameter.
#[derive(Debug, Clone)]
pub struct FunctionTypeParam {
    /// The name of the parameter (e.g. `name` in `(name: string) => string`)
    pub name: String,
    /// The type annotation of the parameter
    pub type_annotation: ParsedType,
    /// Whether the parameter is optional
    pub optional: bool,
}

/// Represents a function's type definition, e.g. `(name: string) => string`
#[derive(Debug, Clone)]
pub struct FunctionType {
    /// The parameters of the function
    pub params: Vec<FunctionTypeParam>,
    /// The return type of the function
    pub return_type: ParsedType,
    /// Potential generics associated with the function
    pub generics: Vec<GenericInfo>,
}
