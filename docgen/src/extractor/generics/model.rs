use crate::parser::types::ParsedType;

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
