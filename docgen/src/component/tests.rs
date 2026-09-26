use crate::test_support::Fixture;
use std::{collections::HashMap, path::PathBuf};

use crate::parser::{
    InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey, ParsedSvelteProp, ParsedType,
    StandardType,
};

use crate::{Result, parser::Interface};

use super::{
    DocgenComponentInput,
    funcs::{generate_interface, resolve_svelte_file},
    generate_component,
};

#[test]
fn resolves_exact_svelte_names_and_single_file_fallbacks() {
    let files = vec![
        PathBuf::from("/components/QBtn.svelte"),
        PathBuf::from("/components/QIconBtn.svelte"),
    ];

    assert_eq!(
        resolve_svelte_file("QIconBtnProps", &files).expect("exact match"),
        PathBuf::from("/components/QIconBtn.svelte")
    );

    let separator = vec![PathBuf::from("/components/QSeparator.svelte")];

    assert_eq!(
        resolve_svelte_file("QSeparatorHorizontalProps", &separator).expect("fallback"),
        PathBuf::from("/components/QSeparator.svelte")
    );
}

#[test]
fn rejects_ambiguous_svelte_fallbacks() {
    let files = vec![
        PathBuf::from("/components/First.svelte"),
        PathBuf::from("/components/Second.svelte"),
    ];
    let error = resolve_svelte_file("QUnknownProps", &files)
        .expect_err("ambiguous fallback should be rejected");

    assert!(error.to_string().contains("received 2 Svelte candidates"));
}

#[test]
fn shared_svelte_defaults_are_reusable_between_interfaces() {
    let defaults = HashMap::from([(
        "vertical".to_string(),
        ParsedSvelteProp {
            default: Some("false".to_string()),
            bindable: false,
        },
    )]);
    let make_interface = |name: &str| Interface {
        name: name.to_string(),
        generics: Vec::new(),
        properties: vec![InterfaceProperty {
            key: InterfacePropertyKey::Identifier("vertical".to_string()),
            type_annotation: ParsedType::Standard(StandardType {
                name: "boolean".to_string(),
            }),
            flags: InterfacePropertyFlags::OPTIONAL,
            comment: None,
        }],
        dom_props_heritage: None,
    };

    let horizontal = generate_interface(
        make_interface("QSeparatorHorizontalProps"),
        &defaults,
        &Default::default(),
        Default::default(),
    )
    .expect("horizontal interface");
    let vertical = generate_interface(
        make_interface("QSeparatorVerticalProps"),
        &defaults,
        &Default::default(),
        Default::default(),
    )
    .expect("vertical interface");

    assert!(horizontal.props[0].header.contains("false"));
    assert!(vertical.props[0].header.contains("false"));
    assert_eq!(defaults["vertical"].default.as_deref(), Some("false"));
}

#[test]
fn includes_type_definitions_used_only_by_methods() -> Result<()> {
    let fixture = Fixture::new();
    let props = fixture.write("props.ts", "export interface TestProps {}");
    let svelte = fixture.write(
        "Test.svelte",
        r#"<script lang="ts">
        type DismissReason = "escape" | "programmatic";
        export function hide(reason: DismissReason = "programmatic") {}
    </script>"#,
    );
    let response = generate_component(DocgenComponentInput {
        props_file: props,
        svelte_files: vec![svelte],
    })?;
    let interface = &response.interfaces[0];

    assert!(
        interface.methods[0]
            .header
            .contains("data-type-name=\"DismissReason\"")
    );
    assert_eq!(
        interface.type_dependencies["DismissReason"],
        "type DismissReason = \"escape\" | \"programmatic\";"
    );
    Ok(())
}

#[test]
fn supports_index_signature_props_with_template_literal_and_optionality() {
    let interface = Interface {
        name: "QTableProps".to_string(),
        generics: Vec::new(),
        properties: vec![InterfaceProperty {
            key: InterfacePropertyKey::IndexSignature {
                name: "key".to_string(),
                type_annotation: ParsedType::TemplateLiteral(crate::parser::TemplateLiteralType {
                    head: "bodyCell".to_string(),
                    spans: vec![crate::parser::TemplateLiteralSpan {
                        type_annotation: ParsedType::Standard(StandardType {
                            name: "string".to_string(),
                        }),
                        literal: String::new(),
                    }],
                }),
            },
            type_annotation: ParsedType::Standard(StandardType {
                name: "string".to_string(),
            }),
            flags: InterfacePropertyFlags::OPTIONAL,
            comment: None,
        }],
        dom_props_heritage: None,
    };

    let generated = generate_interface(
        interface,
        &Default::default(),
        &Default::default(),
        Default::default(),
    )
    .expect("table interface");

    assert_eq!(generated.props.len(), 1);
    assert_eq!(generated.props[0].name, "bodyCell{string}");
    assert!(
        generated.props[0]
            .header
            .contains("<b>bodyCell{string}</b>")
    );
    assert!(generated.props[0].header.contains("?:"));
    assert!(generated.props[0].header.contains("undefined"));
}

#[test]
fn supports_index_signature_snippets_with_template_literal() {
    let interface = Interface {
        name: "QTableProps".to_string(),
        generics: Vec::new(),
        properties: vec![InterfaceProperty {
            key: InterfacePropertyKey::IndexSignature {
                name: "key".to_string(),
                type_annotation: ParsedType::TemplateLiteral(crate::parser::TemplateLiteralType {
                    head: "bodyCell".to_string(),
                    spans: vec![crate::parser::TemplateLiteralSpan {
                        type_annotation: ParsedType::Standard(StandardType {
                            name: "string".to_string(),
                        }),
                        literal: String::new(),
                    }],
                }),
            },
            type_annotation: ParsedType::Snippet(HashMap::from([(
                "row".to_string(),
                ParsedType::Standard(StandardType {
                    name: "QTableRow".to_string(),
                }),
            )])),
            flags: InterfacePropertyFlags::OPTIONAL,
            comment: None,
        }],
        dom_props_heritage: None,
    };

    let generated = generate_interface(
        interface,
        &Default::default(),
        &Default::default(),
        Default::default(),
    )
    .expect("table interface");

    assert_eq!(generated.props.len(), 0);
    assert_eq!(generated.snippets.len(), 1);
    assert_eq!(generated.snippets[0].name, "bodyCell{string}");
    assert!(
        generated.snippets[0]
            .header
            .contains("<b>bodyCell{string}</b>")
    );
    assert!(generated.snippets[0].header.contains("?.({ row:"));
}

#[test]
fn renders_inherited_defaults_with_local_overrides_and_local_bindability() -> Result<()> {
    let fixture = Fixture::new();
    let props = fixture.write(
        "props.ts",
        r#"
        export interface QBtnProps {
            flat?: boolean;
            selected?: boolean;
            disabled?: boolean;
            cleared?: boolean;
            label?: string;
        }
        export interface QIconBtnProps extends Omit<QBtnProps, "label"> {
            /** @default true */
            disabled?: boolean;
        }
    "#,
    );
    let button = fixture.write(
        "QBtn.svelte",
        r#"<script lang="ts">
        import type { QBtnProps } from "./props";
        let { flat = false, selected = $bindable(false), disabled = false, cleared = true } = $props();
        export function update(props: QBtnProps) {}
    </script>"#,
    );
    let icon = fixture.write(
        "QIconBtn.svelte",
        r#"<script lang="ts">let { cleared = undefined } = $props();</script>"#,
    );
    let response = generate_component(DocgenComponentInput {
        props_file: props,
        svelte_files: vec![button, icon],
    })?;
    let interfaces = &response.interfaces;
    let button = interfaces
        .iter()
        .find(|interface| interface.name == "QBtnProps")
        .unwrap();
    let icon = interfaces
        .iter()
        .find(|interface| interface.name == "QIconBtnProps")
        .unwrap();
    let props = icon
        .props
        .iter()
        .map(|prop| (prop.name.as_str(), prop))
        .collect::<HashMap<_, _>>();

    assert!(props["flat"].header.contains("false"));
    assert!(props["selected"].header.contains("false"));
    assert!(!props["selected"].header.contains("$bindable"));
    assert!(props["disabled"].header.contains("true"));
    assert!(props["cleared"].header.contains("undefined"));
    assert!(!props.contains_key("label"));
    assert_eq!(button.methods[0].name, "update");
    Ok(())
}
