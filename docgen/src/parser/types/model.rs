use std::collections::HashMap;

use crate::parser::types::{
    functions::FunctionType,
    interfaces::{Interface, InterfaceProperty},
    ts_utilities::{UtilityKVKind, UtilityTKind},
};

/// Type used for primitive types or types that couldn't be resolved to an external type.
///
/// For example, `string`, `number`, `boolean`, etc.
#[derive(Debug, Clone)]
pub struct StandardType {
    /// The full text of the type definition
    pub name: String,
}

/// Type used for complex types, such as `interface`s or `type` aliases.
///
/// These types can (but are not bound to) depend on other "complex" types.
/// In this case, the name of those other types will be accessible through the `dependencies` property.
///
/// For example, `QSize` or `CssValue`.
#[derive(Debug, Clone)]
pub struct ReferenceType {
    /// The name of the type as it appears in the source code (e.g. `QSize`)
    pub name: String,
    /// The names of other "complex" types that this type depends on
    /// (e.g. `["CssUnit"]` which `CssValue` depends on)
    pub parsed: Box<ParsedType>,
}

/// Corresponds to a type definition from an external package (including built-in DOM types).
///
/// These types link to external documentation sources like MDN, google fonts or svelte's docs.
///
/// For example, `MaterialSymbol` will link to `fonts.google.com/icons`.
#[derive(Debug, Clone)]
pub struct ExternalType {
    /// The name of the type as it appears in the source code (e.g. `MaterialSymbol`)
    pub name: String,
    /// The URL to the external documentation source
    pub type_src: String,
}

/// A parsed type.
///
/// This is a recursive data structure that can be used to represent a lot of types in TypeScript.
#[derive(Debug, Clone)]
pub enum ParsedType {
    /// An external type, see [ExternalType] for more information
    External(ExternalType),
    /// A standard type, see [StandardType] for more information
    Standard(StandardType),
    /// A complex type, see [ComplexType] for more information
    Reference(ReferenceType),
    /// A TS utility type with one type argument, e.g. `Partial<T>`
    UtilityT {
        kind: UtilityTKind,
        t: Box<ParsedType>,
    },
    /// A TS utility type with two type arguments, e.g. `Record<K, V>`
    UtilityKV {
        kind: UtilityKVKind,
        k: Box<ParsedType>,
        v: Box<ParsedType>,
    },
    /// An interface type, see [Interface] for more information
    Interface(Interface),
    /// A type literal, which is just an inline interface, without a name or generics.
    /// It can be represented as a vec of properties.
    TypeLiteral(Vec<InterfaceProperty>),
    /// A function type, see [FunctionType] for more information
    Function(Box<FunctionType>),
    /// A union of [ParsedType]. The vector will always contain more than one element.
    Union(Vec<ParsedType>),
    /// An intersection of [ParsedType]. The vector will always contain more than one element.
    Intersection(Vec<ParsedType>),
}

/// Type dependencies associated with a given type.
/// The key is the given type's name, and the value an array of its dependencies.
pub type TypeDependencies = HashMap<String, Vec<ParsedType>>;
