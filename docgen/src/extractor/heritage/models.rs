use crate::parser::{InterfaceProperty, ParsedType};

/// Represents the heritage clauses of an interface (e.g. `extends Clickable, HTMLAttributes<...>`)
#[derive(Debug)]
pub struct HeritageInfo {
    /// The DOM attributes constraint if the interface extends `HTMLAttributes<...>` or similar
    pub dom: Option<ParsedType>,
    /// A collection of properties from interfaces that the current interface extends, excluding DOM attributes and the like.
    pub herited_props: Vec<InterfaceProperty>,
}

/// Properties and DOM heritage recovered from an inherited type expression.
pub(super) type InheritedProperties = (Vec<InterfaceProperty>, Option<Box<ParsedType>>);
