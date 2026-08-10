use std::sync::OnceLock;

use regex::Regex;

/// Maps external type names to their documentation URLs.
/// Regexes can capture named groups that will be formatted into the value string.
pub struct TypeSrcMapping {
    /// The type name or regex to match
    pub src: &'static str,
    /// The URL to the documentation source.
    ///
    /// For regexes, named groups can be formatted into the value string.
    /// The named groups can be referenced in the value string as `$name`.
    pub value: &'static str,
    /// Whether `src` should be interpreted as a regex pattern
    pub(super) is_regex: bool,
    /// Lazily compiled regex, populated on first use
    pub(super) regex_cache: OnceLock<Regex>,
}
