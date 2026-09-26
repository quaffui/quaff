use std::collections::BTreeMap;

use crate::{Result, parser::ParsedPropsInterface, test_support::Fixture};

use super::InterfacePropertyFlags;

/// Collects property defaults for inheritance assertions.
fn defaults(interface: &ParsedPropsInterface) -> BTreeMap<String, Option<&str>> {
    interface
        .interface
        .properties
        .iter()
        .map(|property| {
            (
                property.key.doc_name(),
                property
                    .comment
                    .as_ref()
                    .and_then(|comment| comment.default.as_deref()),
            )
        })
        .collect()
}

#[test]
fn inherits_button_defaults_without_inheriting_bindability() -> Result<()> {
    let fixture = Fixture::new();
    fixture.write(
        "props.ts",
        r#"
            export interface QBtnProps { flat?: boolean; selected?: boolean; label?: string; }
            export interface QIconBtnProps extends Omit<QBtnProps, "label"> { width?: string; }
        "#,
    );
    fixture.write(
        "QBtn.svelte",
        r#"<script lang="ts">let { flat = false, selected = $bindable(false) } = $props();</script>"#,
    );
    fixture.write(
        "QIconBtn.svelte",
        r#"<script lang="ts">let { width = "default" } = $props();</script>"#,
    );
    let parsed = fixture.parse("props.ts")?;
    let icon = &parsed["QIconBtnProps"];
    let defaults = defaults(icon);

    assert_eq!(defaults["flat"], Some("false"));
    assert_eq!(defaults["selected"], Some("false"));
    assert_eq!(defaults["width"], Some("\"default\""));
    assert!(!defaults.contains_key("label"));
    assert!(
        icon.interface
            .properties
            .iter()
            .all(|property| { !property.flags.contains(InterfacePropertyFlags::BINDABLE) })
    );
    Ok(())
}

#[test]
fn inherits_transitive_cross_file_defaults_through_aliases_and_filtered_types() -> Result<()> {
    let fixture = Fixture::new();
    fixture.write(
        "base/props.ts",
        r#"export interface BaseProps { flat?: boolean; disabled?: boolean; removed?: boolean; }"#,
    );
    fixture.write(
        "base/Base.svelte",
        r#"<script>let { flat = false, disabled = false, removed = true } = $props();</script>"#,
    );
    fixture.write(
        "middle/props.ts",
        r#"
            import type { BaseProps as OriginalProps } from "../base/props";
            export interface MiddleProps extends Omit<OriginalProps, "removed"> {}
        "#,
    );
    fixture.write(
        "middle/Middle.svelte",
        r#"<script>let { flat = true } = $props();</script>"#,
    );
    fixture.write(
        "leaf/props.ts",
        r#"
            import type { MiddleProps } from "../middle/props";
            interface CommonProps extends MiddleProps {}
            type SelectedProps = Pick<CommonProps, "flat">;
            export interface LeafProps extends SelectedProps {}
        "#,
    );
    let parsed = fixture.parse("leaf/props.ts")?;

    assert_eq!(
        defaults(&parsed["LeafProps"]),
        BTreeMap::from([("flat".to_string(), Some("true"))])
    );
    Ok(())
}

#[test]
fn local_declarations_jsdoc_and_explicit_undefined_override_ancestor_defaults() -> Result<()> {
    let fixture = Fixture::new();
    fixture.write(
        "props.ts",
        r#"
            export interface ParentProps {
                documented?: boolean;
                local?: boolean;
                cleared?: boolean;
                redeclared?: boolean;
            }
            export interface ChildProps extends ParentProps {
                /** @default true */
                documented?: boolean;
                /** @default true */
                local?: boolean;
                redeclared?: boolean;
            }
        "#,
    );
    fixture.write(
        "Parent.svelte",
        r#"<script>let { documented = false, local = true, cleared = false, redeclared = true } = $props();</script>"#,
    );
    fixture.write(
        "Child.svelte",
        r#"<script>let { local = false, cleared = undefined } = $props();</script>"#,
    );
    let parsed = fixture.parse("props.ts")?;
    let defaults = defaults(&parsed["ChildProps"]);

    assert_eq!(defaults["documented"], Some("true"));
    assert_eq!(defaults["local"], Some("false"));
    assert_eq!(defaults["cleared"], Some("undefined"));
    assert_eq!(defaults["redeclared"], None);
    Ok(())
}

#[test]
fn does_not_guess_svelte_files_for_shared_prop_interfaces() -> Result<()> {
    let fixture = Fixture::new();
    fixture.write(
        "props.ts",
        r#"
            interface ButtonCommonProps { flat?: boolean; }
            export interface OtherProps extends ButtonCommonProps {}
        "#,
    );
    fixture.write(
        "Button.svelte",
        r#"<script>let { flat = false } = $props();</script>"#,
    );
    let parsed = fixture.parse("props.ts")?;

    assert_eq!(defaults(&parsed["OtherProps"])["flat"], None);
    Ok(())
}
