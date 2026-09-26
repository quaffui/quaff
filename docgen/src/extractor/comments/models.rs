/// Represents the JSDoc documentation for an interface's property.
#[derive(Debug, Clone)]
pub struct CommentInfo {
    /// The JSDoc description explaining the property's purpose
    pub description: String,
    /// The default value from the `@default` JSDoc tag, if present
    /// NOTE: This can be later overriden by a Svelte $props default value.
    pub default: Option<String>,
}
