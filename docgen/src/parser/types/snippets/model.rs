use std::collections::HashMap;

use crate::parser::types::ParsedType;

/// Holds relevent information about a Svelte snippet.
///
/// Is parsed from the component's props and the Snippet type.
#[derive(Debug)]
pub struct Snippet {
    /// Name of the property
    pub name: String,
    /// Whether the snippet is optional or not
    pub optional: bool,
    /// Description of the snippet
    pub description: String,
    /// The snippet's parameters defined like `Snippet<[...]>`.
    /// Maps snippet parameter names to their type annotations.
    ///
    /// `Snippet` means no parameters.
    pub params: HashMap<String, ParsedType>,
}
