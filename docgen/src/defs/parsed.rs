use std::collections::HashMap;

use oxc::ast::ast::{TSInterfaceDeclaration, TSTypeAliasDeclaration, VariableDeclarator};
use oxc_semantic::Semantic;

use crate::defs::FunctionType;

use super::structs::{ComplexType, ExternalType, StandardType};

/// Flags indicating the property's characteristics
pub enum ParsedPropertyFlags {
    /// No flags set
    None = 0,
    /// The property is marked as optional with `?`
    Optional = 1,
    /// The property's type is a Svelte `Snippet`
    Snippet = 2,
    /// The property's type uses the `Array<T>` form (converted to `T[]` in output)
    Array = 4,
    /// The property is bindable (e.g. `$bindable` in the `$props` declaration)
    Bindable = 8,
    /// The property is an `Omit<T, U>` utility type
    Omit = 16,
    /// The property is an `Exclude<T, U>` utility type
    Exclude = 32,
    /// The property is a `Pick<T, U>` utility type
    Pick = 64,
    /// The property is an `Extract<T, U>` utility type
    Extract = 128,
    /// The property is a `Partial<T>` utility type
    Partial = 256,
    /// The property is a `Required<T>` utility type
    Required = 512,
    /// The property is a `Readonly<T>` utility type
    Readonly = 1024,
    /// The property is a `Record<T, U>` utility type
    Record = 2048,
    /// The property is a `NonNullable<T>` utility type
    NonNullable = 4096,
    /// The property is a `ReturnType<T>` utility type
    ReturnType = 8192,
    /// The property is a `InstanceType<T>` utility type
    InstanceType = 16384,
    /// The property is a `ThisParameterType<T>` utility type
    ThisParameterType = 32768,
    /// The property is a `ThisType<T>` utility type
    ThisType = 65536,
}

/// A parsed type. Can be standard, external or complex.
#[derive(Clone)]
pub enum ParsedType {
    /// An external type, see [ExternalType] for more information
    External(ExternalType),
    /// A standard type, see [StandardType] for more information
    Standard(StandardType),
    /// A complex type, see [ComplexType] for more information
    Complex(ComplexType),
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

/// Represents a generic type parameter of an interface (e.g. `<T extends string>`).
#[derive(Clone)]
pub struct ParsedGeneric {
    /// Name of the generic type parameter (e.g. "T")
    pub name: String,
    /// Constraint text if the generic extends a type (e.g. "string")
    pub constraint: Option<ParsedType>,
    /// Default value if the generic has one (e.g. "T = string")
    pub default: Option<ParsedType>,
}

/// Represents the heritage clauses of an interface (e.g. `extends Clickable, HTMLAttributes<...>`)
pub struct ParsedHeritage {
    /// The DOM attributes constraint if the interface extends `HTMLAttributes<...>` or similar
    pub dom: Option<ParsedType>,
    /// A collection of properties from interfaces that the current interface extends, excluding DOM attributes and the like.
    pub herited_props: ParsedProperties,
}

/// Represents a single parsed property from an interface.
pub struct ParsedProperty {
    /// The property's identifier name (e.g. "disabled", "icon")
    pub name: String,
    /// The JSDoc description explaining the property's purpose
    pub description: String,
    /// Flags indicating the property's characteristics (see [ParsedPropertyFlags])
    pub flags: u64,
    /// The computed type(s) for this property. A single [ParsedType] for simple types (Vec of size 1), or an array of [ParsedType] for union types (Vec of size >= 2).
    pub type_def: Vec<ParsedType>,
    /// The default value from the `@default` JSDoc tag, if present
    pub default: Option<String>,
}

/// A map of property names to their parsed properties.
/// It allows overriding earlier ones, matching the behaviour of TypeScript's type merging.
pub type ParsedProperties = HashMap<String, ParsedProperty>;

/// Represents a fully parsed TypeScript interface.
pub struct ParsedInterface {
    /// The full text of the DOM attributes extension clause, if the interface extends `HTMLAttributes<...>` or similar.
    pub dom_attributes_constraint: Option<ParsedType>,
    /// The interface's generic type parameters.
    pub generics: Vec<ParsedGeneric>,
    /// All parsed properties, including those inherited from extended internal interfaces.
    pub properties: Vec<ParsedProperty>,
    /// The resolved type dependencies for the interface.
    pub type_dependencies: HashMap<String, Vec<ParsedType>>,
}

#[derive(Debug)]
pub enum ParsedDefault {
    /// The default value from the Svelte `$props` declaration (e.g. `{ myProp = false }`)
    Value(Option<String>),
    /// The property is bindable in the `$props` declaration (e.g. `{ myProp = $bindable(false) }`)
    Bindable(Option<String>),
}

/// Information about a property's default value and bindable status, derived from the component's Svelte file.
///
/// Used to enrich the [ParsedProperty] type.
pub type ParsedDefaults = HashMap<String, ParsedDefault>;

/// An enum of AstKind variants that can be resolved from a reference.
pub enum ResolvedReference<'a> {
    /// A reference to a variable declarator.
    VariableDeclarator(&'a VariableDeclarator<'a>, &'a Semantic<'a>),
    /// A reference to a type alias declaration.
    TSTypeAliasDeclaration(&'a TSTypeAliasDeclaration<'a>, &'a Semantic<'a>),
    /// A reference to an interface declaration.
    TSInterfaceDeclaration(&'a TSInterfaceDeclaration<'a>, &'a Semantic<'a>),
}
