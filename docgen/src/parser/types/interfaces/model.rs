use bitflags::bitflags;

use crate::{
    extractor::{comments::CommentInfo, generics::GenericInfo},
    parser::types::ParsedType,
};

bitflags! {
    /// Flags indicating the property's characteristics
    #[derive(Debug, Clone, Default)]
    pub struct InterfacePropertyFlags: u8 {
        /// No flags set
        const None = 0;
        /// The property is marked as optional with `?`
        const Optional = 1 << 0;
        /// The property's type is a Svelte `Snippet`
        const Snippet = 1 << 1;
        /// The property is bindable (e.g. `$bindable` in the `$props` declaration)
        const Bindable = 1 << 2;
    }
}

/// Represents an interface's property, e.g. `name: string` or `disabled?: boolean`
#[derive(Debug, Clone)]
pub struct InterfaceProperty {
    /// The property's name (e.g. `name` in `interface MyInterface { name: string }`).
    pub name: String,
    /// The type annotation of the property.
    pub type_annotation: ParsedType,
    /// Flags indicating the property's characteristics (see [ParsedPropertyFlags])
    pub flags: InterfacePropertyFlags,
    /// Comment associated with the property, including its description and an optional default value.
    pub comment: Option<CommentInfo>,
    /// Type arguments to replace the generic with.
    ///
    /// This is exposed for internal use only, e.g. when dealing with interface heritage.
    /// For example in `interface MyProps extends OptionalModel<boolean>`, the generic `T` in the
    /// resolved `OptionalModel` interface's properties will be replaced by `boolean`.
    pub(super) type_args: Vec<ParsedType>,
}

/// Represents an interface type definition, e.g. `interface MyInterface {}`.
///
/// Given the similarities, it could also represent an oxc `TypeLiteral`.
#[derive(Debug, Clone)]
pub struct Interface {
    /// The name of the interface (or type alias in the case of `TypeLiteral`)
    pub name: String,
    /// The interface's generic type parameters.
    pub generics: Vec<GenericInfo>,
    /// All parsed properties, including those inherited from extended internal interfaces.
    pub properties: Vec<InterfaceProperty>,
    /// Optional, stores the DOM type when the interface extends `HTMLAttributes<...>` or similar.
    pub dom_props_heritage: Option<Box<ParsedType>>,
}
