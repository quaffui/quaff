use std::sync::LazyLock;

use regex::Regex;

/// Tokens needed to scan dependencies through incomplete TypeScript.
pub(super) static TOKENS: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
    r#"(?s)//[^\r\n]*|/\*.*?(?:\*/|$)|"(?:\\.|[^"\\\r\n])*"?|'(?:\\.|[^'\\\r\n])*'?|[\p{L}_$][\p{L}\p{N}_$]*|[^\s]"#
).unwrap()
});

/// Escapes and expression boundaries inside template literals.
pub(super) static BOUNDARIES: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?s)\\.|`|\$\{").unwrap());
