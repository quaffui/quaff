use crate::defs::{ParsedComment, ParsedGeneric, ParsedType, TYPE_SRC_MAPPINGS};

/// Type used for primitive types or types that couldn't be resolved to an external type.
///
/// For example, `string`, `number`, `boolean`, etc.
#[derive(Debug, Clone)]
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
#[derive(Debug, Clone)]
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
    pub fn maybe_new(name: String) -> Option<Self> {
        let maybe_src_mapping = TYPE_SRC_MAPPINGS.iter().find(|m| m.matches(&name));

        if let Some(src_mapping) = maybe_src_mapping {
            let type_src = src_mapping.map(&name);

            return Some(Self { name, type_src });
        }

        None
    }
}

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
    pub generics: Vec<ParsedGeneric>,
}

/// Represents an interface's property, e.g. `name: string` or `disabled?: boolean`
#[derive(Debug, Clone)]
pub struct InterfaceProperty {
    /// The property's name (e.g. `name` in `(name: string) => string`)
    pub name: String,
    /// The type annotation of the property
    pub type_annotation: ParsedType,
    /// Whether the property is optional
    pub optional: bool,
    /// Comment associated with the property
    pub comment: Option<ParsedComment>,
    /// Type arguments to replace the generic with.
    type_args: Vec<ParsedType>,
}

impl InterfaceProperty {
    pub fn new(
        name: String,
        type_annotation: ParsedType,
        optional: bool,
        comment: Option<ParsedComment>,
    ) -> Self {
        Self {
            name,
            type_annotation,
            optional,
            comment,
            type_args: vec![],
        }
    }

    pub fn with_type_args(mut self, type_args: &Vec<ParsedType>) -> Self {
        self.type_args = type_args.clone();
        self
    }
}

/// Represents an interface type definition, e.g. `interface MyInterface {}`.
///
/// Given the similarities, it could also represent an oxc `TypeLiteral`.
#[derive(Debug, Clone)]
pub struct InterfaceType {
    /// The name of the interface (or type alias in the case of `TypeLiteral`)
    pub name: String,
    /// The interface's generic type parameters.
    pub generics: Vec<ParsedGeneric>,
    /// All parsed properties, including those inherited from extended internal interfaces.
    pub properties: Vec<InterfaceProperty>,
}
