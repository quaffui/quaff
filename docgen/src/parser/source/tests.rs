use super::{ParseSource, funcs::instance_script};

#[test]
fn reads_instance_scripts_with_reordered_attributes_and_skips_modules() {
    let source = r#"
        <script lang="ts" module>export const shared = 1;</script>
        <script generics="T extends Record<string, unknown>" lang='ts'>let { value } = $props();</script>
    "#;
    assert_eq!(instance_script(source), Some("let { value } = $props();"));
    assert_eq!(
        instance_script("<script context='module'>export const shared = 1;</script>"),
        None
    );
    assert_eq!(instance_script("<div>No script</div>"), None);
}

#[test]
fn skips_commented_scripts_without_stripping_script_string_contents() {
    let live_script = r#"let { value = "<!--live-->", marker = "<!--" } = $props();"#;
    let source = format!(
        r#"
            <!-- <script lang="ts">let {{ value = "wrong" }} = $props();</script> -->
            <script module>const marker = "<!--";</script>
            <!-- Another comment containing <script>invalid TypeScript</script> -->
            <script lang="ts">{live_script}</script>
        "#
    );
    assert_eq!(instance_script(&source), Some(live_script));
    assert_eq!(
        instance_script("<!-- <script>commentedOut()</script> -->"),
        None
    );
}

#[test]
fn quoted_comment_markers_before_scripts_do_not_hide_scripts() {
    let live_script = r#"let { value = "-->" } = $props();"#;

    for prefix in [
        r#"<div title="<!--"></div>"#,
        r#"<div title='<!--'></div>"#,
        r#"<style>.marker::before { content: "<!--" }</style>"#,
    ] {
        let source = format!("{prefix}<script lang=\"ts\">{live_script}</script>");
        assert_eq!(instance_script(&source), Some(live_script), "{prefix}");
    }
}

#[test]
fn rejects_invalid_typescript_instead_of_emitting_partial_docs() {
    let result = "export interface Props { value: }"
        .to_string()
        .parse_source(|_, _| Ok(false));
    assert!(result.is_err());
}
