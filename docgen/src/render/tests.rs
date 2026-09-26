use std::collections::BTreeMap;

use super::render;
use crate::component::DocgenInterface;
use crate::{Result, component::DocgenComponentOutput};

fn component(names: &[&str]) -> DocgenComponentOutput {
    DocgenComponentOutput {
        props_file: "/components/test/props.ts".into(),
        interfaces: names
            .iter()
            .map(|name| DocgenInterface {
                name: (*name).to_string(),
                component_name: None,
                description: None,
                generics: Vec::new(),
                dom_attributes_constraint: None,
                props: Vec::new(),
                snippets: Vec::new(),
                methods: Vec::new(),
                type_dependencies: BTreeMap::new(),
            })
            .collect(),
    }
}

#[test]
fn renders_distinct_exports_and_preserves_special_type_names_and_text() -> Result<()> {
    let mut input = component(&["ZProps", "aProps", "AProps", "_Props", "$Props"]);
    input.interfaces[0].description = Some("Quoted \"text\", newline\n\0 and 🦀".to_string());
    input.interfaces[0].component_name = Some("Shared".to_string());
    input.interfaces[0].type_dependencies = BTreeMap::from([
        ("__proto__".to_string(), "type Value = string".to_string()),
        ("constructor".to_string(), "type Value = string".to_string()),
    ]);
    let mut calls = Vec::new();
    let output = render(
        vec![(input, "test-hash".into())],
        &mut |sources, can_fallback| {
            calls.push((can_fallback, sources.clone()));
            Ok(sources)
        },
    )?;
    let source = &output[0].contents;

    assert_eq!(calls.len(), 2);
    assert_eq!(calls[0], (true, vec!["type Value = string".to_string()]));
    assert!(!calls[1].0);
    assert!(source.contains("componentName: \"Shared\""));
    assert!(source.contains(r#"description: "Quoted \"text\", newline\n\u0000 and 🦀""#));
    assert!(source.contains(r#"Object.fromEntries([["__proto__","type Value = string"],["constructor","type Value = string"]])"#));
    let exports = ["_Docs", "$Docs", "aDocs", "ADocs", "ZDocs"];
    let offsets = exports.map(|name| source.find(&format!("export const {name}:")).unwrap());
    assert!(offsets.windows(2).all(|pair| pair[0] < pair[1]));
    assert!(source.contains("domAttributesConstraint: undefined"));
    Ok(())
}

#[test]
fn rejects_unsupported_exports_and_formatter_failures() {
    for names in [&["Props"][..], &["ÜProps"], &[]] {
        assert!(
            render(
                vec![(component(names), "hash".into())],
                &mut |sources, _| Ok(sources)
            )
            .is_err()
        );
    }

    assert!(
        render(
            vec![(component(&["AProps"]), "hash".into())],
            &mut |_, _| Ok(Vec::new())
        )
        .is_err()
    );
    assert!(
        render(
            vec![(component(&["AProps"]), "hash".into())],
            &mut |_, _| Err("Formatter failed".into())
        )
        .is_err()
    );
}
