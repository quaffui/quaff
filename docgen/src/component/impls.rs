use std::{collections::HashMap, path::PathBuf};

use crate::{
    Result,
    extractor::comments::CommentInfo,
    parser::{
        ParsedPropsInterface, TSPropsParser,
        svelte::{
            ParsedSvelteMethods, ParsedSvelteProps, parse_component_description, parse_svelte_file,
        },
        types::{
            interfaces::{Interface, InterfacePropertyFlags, InterfacePropertyKey},
            snippets::Snippet,
        },
    },
    resolver::PathResolver,
    transformer::html::{QApiPropInfo, ToHtml},
};

use super::model::{DocgenComponentInput, DocgenComponentOutput, DocgenInterface, QApiGeneric};

pub(crate) fn generate_component(component: DocgenComponentInput) -> Result<DocgenComponentOutput> {
    eprintln!("processing {}", component.props_file.display());
    let props_file = &component.props_file;
    let svelte_files = &component.svelte_files;
    let resolver = PathResolver(props_file);
    let parsed_interfaces = props_file.parse_props(&resolver)?;
    let mut parsed_svelte_files = HashMap::new();
    let mut interfaces = Vec::with_capacity(parsed_interfaces.len());

    for ParsedPropsInterface {
        interface,
        type_definitions,
    } in parsed_interfaces.into_values()
    {
        let svelte_file = resolve_svelte_file(&interface.name, svelte_files)?;

        if !parsed_svelte_files.contains_key(&svelte_file) {
            let (props, methods) = parse_svelte_file(&svelte_file)?;
            parsed_svelte_files.insert(svelte_file.clone(), (props, methods));
        }

        let (svelte_props, svelte_methods) = parsed_svelte_files
            .get(&svelte_file)
            .expect("parsed Svelte file was inserted above");

        let mut docs =
            generate_interface(interface, svelte_props, svelte_methods, type_definitions)?;
        docs.component_name = svelte_file
            .file_stem()
            .and_then(|name| name.to_str())
            .map(str::to_owned);
        docs.description = parse_component_description(&svelte_file)?;
        interfaces.push(docs);
    }

    Ok(DocgenComponentOutput {
        props_file: component.props_file,
        interfaces,
    })
}

fn resolve_svelte_file(interface_name: &str, svelte_files: &[PathBuf]) -> Result<PathBuf> {
    let component_name = interface_name
        .strip_suffix("Props")
        .ok_or_else(|| format!("Expected a *Props interface, found {interface_name}"))?;
    let expected_name = format!("{component_name}.svelte");
    if let Some(path) = svelte_files
        .iter()
        .find(|path| path.file_name().and_then(|name| name.to_str()) == Some(&expected_name))
    {
        return Ok(path.clone());
    }

    if let [path] = svelte_files {
        return Ok(path.clone());
    }

    Err(format!(
        "Could not match {interface_name} to {expected_name}; received {} Svelte candidates",
        svelte_files.len()
    )
    .into())
}

fn generate_interface(
    interface: Interface,
    svelte_props: &ParsedSvelteProps,
    svelte_methods: &ParsedSvelteMethods,
    mut type_dependencies: std::collections::BTreeMap<String, String>,
) -> Result<DocgenInterface> {
    let Interface {
        name,
        generics,
        properties,
        dom_props_heritage,
    } = interface;
    let generics = generics
        .into_iter()
        .map(|generic| QApiGeneric {
            name: generic.name,
            constraint: generic.constraint.map(ToHtml::to_html),
            default: generic.default.map(ToHtml::to_html),
        })
        .collect();
    let dom_attributes_constraint = dom_props_heritage.map(|heritage| heritage.to_html());
    let mut props = Vec::new();
    let mut snippets = Vec::new();

    for property in properties {
        let mut property = match Snippet::try_from(property) {
            Ok(snippet) => {
                snippets.push(QApiPropInfo::from(snippet));
                continue;
            }
            Err(property) => property,
        };
        let comment = property.comment.get_or_insert_with(CommentInfo::default);

        comment
            .default
            .get_or_insert_with(|| "undefined".to_string());

        if let InterfacePropertyKey::Identifier(property_name) = &property.key
            && let Some(svelte_prop) = svelte_props.get(property_name)
        {
            if svelte_prop.bindable {
                property.flags |= InterfacePropertyFlags::Bindable;
            }

            if let Some(default) = &svelte_prop.default {
                let default = default.clone();
                comment.default = Some(default);
            }
        }

        props.push(QApiPropInfo::try_from(property)?);
    }

    for method in svelte_methods.values() {
        for (type_name, definition) in &method.type_definitions {
            if let Some(existing) = type_dependencies.insert(type_name.clone(), definition.clone())
                && existing != *definition
            {
                return Err(
                    format!("Conflicting type definitions for {type_name} in {name}").into(),
                );
            }
        }
    }

    let mut methods = svelte_methods
        .values()
        .cloned()
        .map(QApiPropInfo::from)
        .collect::<Vec<_>>();
    methods.sort_by(|left, right| left.name.cmp(&right.name));

    props.sort_by(|left, right| left.name.cmp(&right.name));
    snippets.sort_by(|left, right| left.name.cmp(&right.name));

    Ok(DocgenInterface {
        name,
        component_name: None,
        description: None,
        generics,
        dom_attributes_constraint,
        props,
        snippets,
        methods,
        type_dependencies,
    })
}

#[cfg(test)]
mod tests {
    use crate::test_support::Fixture;
    use std::collections::HashMap;

    use crate::parser::{
        svelte::ParsedSvelteProp,
        types::{
            ParsedType, StandardType,
            interfaces::{InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        },
    };

    use super::*;

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
                flags: InterfacePropertyFlags::Optional,
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
                    type_annotation: ParsedType::TemplateLiteral(
                        crate::parser::types::TemplateLiteralType {
                            head: "bodyCell".to_string(),
                            spans: vec![crate::parser::types::TemplateLiteralSpan {
                                type_annotation: ParsedType::Standard(StandardType {
                                    name: "string".to_string(),
                                }),
                                literal: String::new(),
                            }],
                        },
                    ),
                },
                type_annotation: ParsedType::Standard(StandardType {
                    name: "string".to_string(),
                }),
                flags: InterfacePropertyFlags::Optional,
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
                    type_annotation: ParsedType::TemplateLiteral(
                        crate::parser::types::TemplateLiteralType {
                            head: "bodyCell".to_string(),
                            spans: vec![crate::parser::types::TemplateLiteralSpan {
                                type_annotation: ParsedType::Standard(StandardType {
                                    name: "string".to_string(),
                                }),
                                literal: String::new(),
                            }],
                        },
                    ),
                },
                type_annotation: ParsedType::Snippet(HashMap::from([(
                    "row".to_string(),
                    ParsedType::Standard(StandardType {
                        name: "QTableRow".to_string(),
                    }),
                )])),
                flags: InterfacePropertyFlags::Optional,
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
}
