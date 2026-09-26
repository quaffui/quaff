use std::collections::HashMap;

use crate::parser::ParsedType;

/// Concrete values assigned to generic type parameters in the current declaration scope.
#[derive(Debug, Clone, Default)]
pub struct GenericBindings(pub(super) HashMap<String, ParsedType>);

/// Represents a generic type parameter of an interface (e.g. `<T extends string>`).
#[derive(Debug, Clone)]
pub struct GenericInfo {
    /// Name of the generic type parameter (e.g. "T")
    pub name: String,
    /// Constraint text if the generic extends a type (e.g. "string")
    pub constraint: Option<ParsedType>,
    /// Default value if the generic has one (e.g. "T = string")
    pub default: Option<ParsedType>,
}
