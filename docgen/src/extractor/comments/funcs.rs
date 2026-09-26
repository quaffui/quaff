/// Removes JSDoc delimiters while preserving description punctuation.
pub(super) fn clean_comment_line(line: &str) -> &str {
    let line = line.trim();
    let line = line.strip_prefix("/**").unwrap_or(line).trim_start();
    let line = line.strip_suffix("*/").unwrap_or(line).trim_end();

    line.strip_prefix('*').unwrap_or(line).trim_start()
}
