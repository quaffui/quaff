use std::collections::HashMap;

/// Represents the default value of a property in a Svelte component.
#[derive(Debug, Default)]
pub struct ParsedSvelteProp {
    /// The default value from the Svelte `$props` declaration (e.g. `{ myProp = false }`)
    pub default: Option<String>,
    /// The property is bindable in the `$props` declaration (e.g. `{ myProp = $bindable(false) }`)
    pub bindable: bool,
}

/// Represents all parsed properties from a Svelte component's `$props` declaration.
/// This is a map from the property name to its parsed value.
pub type ParsedSvelteProps = HashMap<String, ParsedSvelteProp>;
