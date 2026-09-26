use std::sync::LazyLock;

use regex::Regex;

/// Finds live script blocks while consuming surrounding markup and raw text.
pub(super) static SCRIPTS: LazyLock<Regex> = LazyLock::new(|| {
    // Consume whole tags and raw-text blocks so comment markers in their contents stay intact.
    Regex::new(
        r#"(?sx)
            <!--.*?-->
            |<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>(.*?)</script\s*>
            |<style\b(?:[^>"']|"[^"]*"|'[^']*')*>.*?</style\s*>
            |</?[A-Za-z][A-Za-z0-9:.-]*(?:[^>"']|"[^"]*"|'[^']*')*>
        "#,
    )
    .unwrap()
});

/// Matches script attribute names and their optional quoted or bare values.
pub(super) static ATTRIBUTES: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?:^|\s)([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?"#).unwrap()
});
