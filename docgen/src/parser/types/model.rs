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
    /// Type arguments supplied at this reference site.
    pub type_args: Vec<ParsedType>,
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

/// A single interpolated type and the literal text that follows it in a template literal type.
#[derive(Debug, Clone)]
pub struct TemplateLiteralSpan {
    pub type_annotation: ParsedType,
    pub literal: String,
}

/// A TypeScript template literal type, e.g. `` `${number}${CssUnit}` ``.
#[derive(Debug, Clone)]
pub struct TemplateLiteralType {
    pub head: String,
    pub spans: Vec<TemplateLiteralSpan>,
}

/// A single tuple element, including named, optional and rest tuple element metadata.
#[derive(Debug, Clone)]
pub struct TupleElement {
    pub label: Option<String>,
    pub type_annotation: ParsedType,
    pub optional: bool,
    pub rest: bool,
}

/// A TypeScript type operator.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TypeOperatorKind {
    Keyof,
    Unique,
    Readonly,
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
    /// A complex type, see [ReferenceType] for more information
    Reference(ReferenceType),
    /// A template literal type with structurally parsed interpolated types.
    TemplateLiteral(TemplateLiteralType),
    /// A Svelte snippet type, containing a map of its parameters' names and their types.
    Snippet(HashMap<String, ParsedType>),
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
    /// A tuple type.
    Tuple(Vec<TupleElement>),
    /// A type operator such as `keyof T` or `readonly T[]`.
    TypeOperator {
        kind: TypeOperatorKind,
        type_annotation: Box<ParsedType>,
    },
    /// An indexed access type such as `T["key"]`.
    IndexedAccess {
        object: Box<ParsedType>,
        index: Box<ParsedType>,
    },
    /// A conditional type such as `T extends string ? A : B`.
    Conditional {
        check: Box<ParsedType>,
        extends: Box<ParsedType>,
        true_type: Box<ParsedType>,
        false_type: Box<ParsedType>,
    },
    /// A union of [ParsedType]. The vector will always contain more than one element.
    Union(Vec<ParsedType>),
    /// An intersection of [ParsedType]. The vector will always contain more than one element.
    Intersection(Vec<ParsedType>),
}
