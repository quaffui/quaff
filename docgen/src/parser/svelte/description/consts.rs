use std::sync::LazyLock;

use regex::Regex;

/// Matches the end of a script raw-text block.
pub(super) static SCRIPT_END: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"</script\s*>").unwrap());

/// Matches the end of a style raw-text block.
pub(super) static STYLE_END: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"</style\s*>").unwrap());
