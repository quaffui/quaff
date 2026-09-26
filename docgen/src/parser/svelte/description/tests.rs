use super::funcs::component_description;

#[test]
fn reads_inline_description_after_script() {
    assert_eq!(
        component_description(
            "<script>let { value } = $props();</script>\n<!-- @component A **useful** component. -->"
        ),
        Some("A **useful** component.")
    );
}

#[test]
fn preserves_markdown_and_code_block_indentation() {
    let description =
        "A **useful** component.\n\n- Usage:\n  ```svelte\n  <Example value={1} />\n  ```";
    let source = format!("<!--\n@component\n{description}\n-->");
    assert_eq!(component_description(&source), Some(description));
}

#[test]
fn returns_none_without_a_nonempty_component_comment() {
    for source in [
        "<div>No description</div>",
        "<!-- Ordinary comment -->",
        "<!-- Mentioning @component does not make this documentation. -->",
        "<!-- @componentExtra Not a description -->",
        "<!-- @component -->",
        "<!-- @component-->",
    ] {
        assert_eq!(component_description(source), None, "{source}");
    }
}

#[test]
fn ignores_comment_markers_inside_scripts_styles_and_attributes() {
    let source = r#"
        <script module>const fake = "<!-- @component Module string -->";</script>
        <script lang="ts">const fake = '<!-- @component Script string -->';</script>
        <style>.example::before { content: "<!-- @component Style string -->"; }</style>
        <div title="<!-- @component Attribute string -->"></div>
        <div title='<!-- @component Single-quoted attribute string -->'></div>
        <div title={'<!-- @component Expression string -->'}></div>
    "#;
    assert_eq!(component_description(source), None);
    assert_eq!(
        component_description(&format!("{source}<!-- @component Actual description -->")),
        Some("Actual description")
    );
}

#[test]
fn ignores_commented_out_scripts_and_unrelated_comments() {
    let source = r#"
        <!-- <script>const marker = "@component";</script> -->
        <!-- svelte-ignore a11y_autofocus -->
        <!-- @component Actual description -->
    "#;
    assert_eq!(component_description(source), Some("Actual description"));
}

#[test]
fn ignores_comment_markers_in_svelte_expressions_and_handlers() {
    for prefix in [
        r#"{'<!-- @component Fake expression -->'}"#,
        r#"<div onclick={() => "<!-- @component Fake handler -->"}></div>"#,
        r#"<div title="{() => "<!-- @component Fake quoted handler -->"}"></div>"#,
        r#"{(() => ({ text: "}<!-- @component Fake nested object -->" }))()}"#,
        r#"{`before ${`nested ${"}<!-- @component Fake template -->"}`} after`}"#,
        r#"{(() => { /* }<!-- @component Fake block comment --> */ return "ok"; })()}"#,
        "{(() => { // }<!-- @component Fake line comment -->\nreturn 'ok'; })()}",
    ] {
        assert_eq!(component_description(prefix), None, "{prefix}");
        let source = format!("{prefix}<!-- @component Real comment -->");
        assert_eq!(
            component_description(&source),
            Some("Real comment"),
            "{prefix}"
        );
    }
}
#[test]
fn handles_regex_braces_without_confusing_division_with_regex() {
    for prefix in [
        r#"{(/\{/.test(text))}"#,
        r#"{(/}/.test(text))}"#,
        r#"{(/[{}]/.test(text))}"#,
        r#"{(/}<!-- @component Fake regex -->/.test(text))}"#,
        r#"<div onclick={() => /\{/.test(text)}></div>"#,
        r#"{total / divisor}<div />"#,
        r#"{(() => { const half = total / 2; return half; })()}"#,
    ] {
        assert_eq!(component_description(prefix), None, "{prefix}");
        let source = format!("{prefix}<!-- @component Real comment -->");
        assert_eq!(
            component_description(&source),
            Some("Real comment"),
            "{prefix}"
        );
    }
}
