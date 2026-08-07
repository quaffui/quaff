use std::collections::HashMap;

use bitflags::bitflags;
use oxc::ast::ast::{TSInterfaceDeclaration, TSTypeAliasDeclaration, VariableDeclarator};
use oxc_semantic::Semantic;

use crate::defs::{FunctionType, InterfaceProperty, InterfaceType};

use super::structs::{ComplexType, ExternalType, StandardType};

bitflags! {
    /// Flags indicating the property's characteristics
    pub struct ParsedPropertyFlags: u32 {
        /// No flags set
        const None = 0;
        /// The property is marked as optional with `?`
        const Optional = 1 << 0;
        /// The property's type is a Svelte `Snippet`
        const Snippet = 1 << 1;
        /// The property's type uses the `Array<T>` form (converted to `T[]` in output)
        const Array = 1 << 2;
        /// The property is bindable (e.g. `$bindable` in the `$props` declaration)
        const Bindable = 1 << 3;
        /// The property is an `Omit<T; U>` utility type
        const Omit = 1 << 4;
        /// The property is an `Exclude<T; U>` utility type
        const Exclude = 1 << 5;
        /// The property is a `Pick<T; U>` utility type
        const Pick = 1 << 6;
        /// The property is an `Extract<T; U>` utility type
        const Extract = 1 << 7;
        /// The property is a `Partial<T>` utility type
        const Partial = 1 << 8;
        /// The property is a `Required<T>` utility type
        const Required = 1 << 9;
        /// The property is a `Readonly<T>` utility type
        const Readonly = 1 << 10;
        /// The property is a `Record<T; U>` utility type
        const Record = 1 << 11;
        /// The property is a `NonNullable<T>` utility type
        const NonNullable = 1 << 12;
        /// The property is a `ReturnType<T>` utility type
        const ReturnType = 1 << 13;
        /// The property is a `InstanceType<T>` utility type
        const InstanceType = 1 << 14;
        /// The property is a `ThisParameterType<T>` utility type
        const ThisParameterType = 1 << 15;
        /// The property is a `ThisType<T>` utility type
        const ThisType = 1 << 16;
    }
}

/// A parsed type. Can be standard, external or complex.
#[derive(Debug, Clone)]
pub enum ParsedType {
    /// An external type, see [ExternalType] for more information
    External(ExternalType),
    /// A standard type, see [StandardType] for more information
    Standard(StandardType),
    /// A complex type, see [ComplexType] for more information
    Complex(ComplexType),
    /// An interface type, see [InterfaceType] for more information
    Interface(InterfaceType),
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

/// Represents a generic type parameter of an interface (e.g. `<T extends string>`).
#[derive(Debug, Clone)]
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
    pub herited_props: ParsedProps,
}

pub struct ParsedComment {
    /// The JSDoc description explaining the property's purpose
    pub description: String,
    /// The default value from the `@default` JSDoc tag, if present
    pub default: Option<String>,
}

/// Represents a single parsed property from an interface.
pub struct ParsedProp {
    /// The property's identifier name (e.g. "disabled", "icon")
    pub name: String,
    /// The JSDoc description explaining the property's purpose
    pub description: String,
    /// Flags indicating the property's characteristics (see [ParsedPropertyFlags])
    pub flags: ParsedPropertyFlags,
    /// The computed type of this property.
    pub type_def: ParsedType,
    /// The default value from the `@default` JSDoc tag, if present
    pub default: Option<String>,
}

/// A map of property names to their parsed information.
/// It allows overriding earlier ones, matching the behaviour of TypeScript's type merging.
pub type ParsedProps = HashMap<String, ParsedProp>;

/// Represents a fully parsed TypeScript interface.
pub struct ParsedPropsInterface {
    /// The full text of the DOM attributes extension clause, if the interface extends `HTMLAttributes<...>` or similar.
    pub dom_attributes_constraint: Option<ParsedType>,
    /// The interface's generic type parameters.
    pub generics: Vec<ParsedGeneric>,
    /// All parsed properties, including those inherited from extended internal interfaces.
    pub properties: ParsedProps,
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

impl ParsedDefault {
    /// Returns the inner value
    fn inner(&self) -> &Option<String> {
        match self {
            Self::Value(val) => val,
            Self::Bindable(val) => val,
        }
    }

    /// Returns `true` if the property is bindable in the `$props` declaration
    pub fn is_bindable(&self) -> bool {
        matches!(self, Self::Bindable(_))
    }

    /// Returns the default value of the property
    pub fn value(&self) -> String {
        self.inner().as_deref().unwrap_or("undefined").to_string()
    }
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

impl<'a> std::fmt::Debug for ResolvedReference<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TSInterfaceDeclaration(decl, _) => decl.fmt(f),
            Self::TSTypeAliasDeclaration(decl, _) => decl.fmt(f),
            Self::VariableDeclarator(decl, _) => decl.fmt(f),
        }
    }
}
