use crate::parser::types::{ParsedType, interfaces::InterfaceProperty};

/// Represents the heritage clauses of an interface (e.g. `extends Clickable, HTMLAttributes<...>`)
#[derive(Debug)]
pub struct HeritageInfo {
    /// The DOM attributes constraint if the interface extends `HTMLAttributes<...>` or similar
    pub dom: Option<ParsedType>,
    /// A collection of properties from interfaces that the current interface extends, excluding DOM attributes and the like.
    pub herited_props: Vec<InterfaceProperty>,
}
