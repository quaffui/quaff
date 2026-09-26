use super::funcs::clean_comment_line;

#[test]
fn removes_jsdoc_markers_without_stripping_description_punctuation() {
    assert_eq!(
        clean_comment_line("  * `primary-container`."),
        "`primary-container`."
    );
    assert_eq!(
        clean_comment_line("  * \"Quoted value\""),
        "\"Quoted value\""
    );
    assert_eq!(
        clean_comment_line("/** <video> fallback */"),
        "<video> fallback"
    );
    assert_eq!(clean_comment_line(" */"), "");
}
