use crate::defs::{ParsedGeneric, ParsedType, TYPE_SRC_MAPPINGS};

/// Type used for primitive types or types that couldn't be resolved to an external type.
///
/// For example, `string`, `number`, `boolean`, etc.
#[derive(Clone)]
pub struct StandardType {
    /// The full text of the type definition
    definition: String,
}

impl StandardType {
    pub fn new(definition: String) -> Self {
        Self { definition }
    }
}

/// Type used for complex types, such as `interface`s or `type` aliases.
///
/// These types can (but are not bound to) depend on other "complex" types.
/// In this case, the name of those other types will be accessible through the `dependencies` property.
///
/// For example, `QSize` or `CssValue`.
#[derive(Clone)]
pub struct ComplexType {
    /// The full text of the type definition
    definition: String,
    /// The names of other "complex" types that this type depends on
    /// (e.g. `["CssUnit"]` which `CssValue` depends on)
    dependencies: Vec<String>,
    /// The name of the type as it appears in the source code (e.g. `QSize`)
    name: String,
}

impl ComplexType {
    pub fn new(definition: String, dependencies: Vec<String>, name: String) -> Self {
        Self {
            definition,
            dependencies,
            name,
        }
    }
}

/// Corresponds to a type definition from an external package (including built-in DOM types).
///
/// These types link to external documentation sources like MDN, google fonts or svelte's docs.
///
/// For example, `MaterialSymbol` will link to `fonts.google.com/icons`.
#[derive(Debug, Clone)]
pub struct ExternalType {
    /// The name of the type as it appears in the source code (e.g. `MaterialSymbol`)
    name: String,
    /// The URL to the external documentation source
    type_src: String,
}

impl ExternalType {
    pub fn new(name: String) -> Self {
        let type_src = TYPE_SRC_MAPPINGS
            .iter()
            .find(|m| m.matches(&name))
            .map(|m| m.map(&name))
            .unwrap_or("#".to_string());

        Self { name, type_src }
    }
}

/// Represents a function parameter.
#[derive(Clone)]
pub struct FunctionTypeParam {
    /// The name of the parameter (e.g. `name` in `(name: string) => string`)
    pub name: String,
    /// The type annotation of the parameter
    pub type_annotation: ParsedType,
    /// Whether the parameter is optional
    pub optional: bool,
}

/// Represents a function's type definition, e.g. `(name: string) => string`
#[derive(Clone)]
pub struct FunctionType {
    /// The parameters of the function
    pub params: Vec<FunctionTypeParam>,
    /// The return type of the function
    pub return_type: ParsedType,
    /// Potential generics associated with the function
    pub generics: Option<Vec<ParsedGeneric>>,
}
