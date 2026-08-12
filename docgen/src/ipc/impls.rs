use std::{
    collections::{BTreeSet, HashMap},
    io::{BufReader, BufWriter},
    path::{Path, PathBuf},
};

use crate::{
    Result,
    extractor::comments::CommentInfo,
    parser::{
        ParsedPropsInterface, TSPropsParser,
        svelte::{ParsedSvelteMethods, ParsedSvelteProps, parse_svelte_file},
        types::{
            interfaces::{Interface, InterfacePropertyFlags, InterfacePropertyKey},
            snippets::Snippet,
        },
    },
    resolver::PathResolver,
    transformer::html::{QApiPropInfo, ToHtml},
};

use super::model::{
    DocgenComponentInput, DocgenComponentOutput, DocgenInterface, DocgenRequest, DocgenResponse,
    PROTOCOL_VERSION, QApiGeneric,
};

pub fn generate() -> Result<()> {
    let request: DocgenRequest = serde_json::from_reader(BufReader::new(std::io::stdin().lock()))?;
    let response = generate_response(request)?;
    let mut stdout = BufWriter::new(std::io::stdout().lock());

    serde_json::to_writer(&mut stdout, &response)?;

    Ok(())
}

fn generate_response(mut request: DocgenRequest) -> Result<DocgenResponse> {
    validate_request(&request)?;
    request
        .components
        .sort_by(|left, right| left.props_file.cmp(&right.props_file));

    let components = request
        .components
        .into_iter()
        .map(generate_component)
        .collect::<Result<Vec<_>>>()?;

    Ok(DocgenResponse {
        version: PROTOCOL_VERSION,
        components,
    })
}

fn validate_request(request: &DocgenRequest) -> Result<()> {
    if request.version != PROTOCOL_VERSION {
        return Err(format!(
            "Unsupported docgen protocol version {}. Expected {PROTOCOL_VERSION}.",
            request.version
        )
        .into());
    }

    let mut props_files = BTreeSet::new();

    for component in &request.components {
        let props_file = Path::new(&component.props_file);

        validate_absolute_file(props_file, "propsFile")?;

        if !props_files.insert(props_file.to_path_buf()) {
            return Err(
                format!("Duplicate docgen component input: {}", props_file.display()).into(),
            );
        }

        let mut svelte_files = BTreeSet::new();

        for svelte_file in &component.svelte_files {
            let svelte_file = Path::new(svelte_file);

            validate_absolute_file(svelte_file, "svelteFiles entry")?;

            if svelte_file
                .extension()
                .and_then(|extension| extension.to_str())
                != Some("svelte")
            {
                return Err(
                    format!("Expected a .svelte file, found {}", svelte_file.display()).into(),
                );
            }

            if svelte_file.parent() != props_file.parent() {
                return Err(format!(
                    "Svelte file {} is not next to props file {}",
                    svelte_file.display(),
                    props_file.display()
                )
                .into());
            }

            if !svelte_files.insert(svelte_file.to_path_buf()) {
                return Err(format!(
                    "Duplicate Svelte file for {}: {}",
                    props_file.display(),
                    svelte_file.display()
                )
                .into());
            }
        }
    }

    Ok(())
}

fn validate_absolute_file(path: &Path, field: &str) -> Result<()> {
    if !path.is_absolute() {
        return Err(format!("{field} must be an absolute path: {}", path.display()).into());
    }

    if !path.is_file() {
        return Err(format!("{field} does not name a file: {}", path.display()).into());
    }

    Ok(())
}

fn generate_component(component: DocgenComponentInput) -> Result<DocgenComponentOutput> {
    eprintln!("processing {}", component.props_file);
    let props_file = PathBuf::from(&component.props_file);
    let svelte_files = component
        .svelte_files
        .iter()
        .map(PathBuf::from)
        .collect::<Vec<_>>();
    let resolver = PathResolver(&props_file);
    let parsed_interfaces = props_file.parse_props(&resolver)?;
    let mut parsed_svelte_files = HashMap::new();
    let mut interfaces = Vec::with_capacity(parsed_interfaces.len());

    for ParsedPropsInterface {
        interface,
        type_definitions,
    } in parsed_interfaces.into_values()
    {
        let svelte_file = resolve_svelte_file(&interface.name, &svelte_files)?;

        if !parsed_svelte_files.contains_key(&svelte_file) {
            let (props, methods) = parse_svelte_file(&svelte_file)?;
            parsed_svelte_files.insert(svelte_file.clone(), (props, methods));
        }

        let (svelte_props, svelte_methods) = parsed_svelte_files
            .get(&svelte_file)
            .expect("parsed Svelte file was inserted above");

        interfaces.push(generate_interface(
            interface,
            svelte_props,
            svelte_methods,
            type_definitions,
        )?);
    }

    interfaces.sort_by(|left, right| left.name.cmp(&right.name));

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
    let exact = svelte_files
        .iter()
        .filter(|path| path.file_name().and_then(|name| name.to_str()) == Some(&expected_name))
        .collect::<Vec<_>>();

    if let [path] = exact.as_slice() {
        return Ok((*path).clone());
    }

    if exact.len() > 1 {
        return Err(
            format!("More than one Svelte file matches {interface_name}: {expected_name}").into(),
        );
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
    type_dependencies: std::collections::BTreeMap<String, String>,
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

        if let InterfacePropertyKey::Identifier(property_name) = &property.key {
            if let Some(svelte_prop) = svelte_props.get(property_name) {
                if svelte_prop.bindable {
                    property.flags |= InterfacePropertyFlags::Bindable;
                }

                if let Some(default) = &svelte_prop.default {
                    let default = default.clone();
                    comment.default = Some(default);
                }
            }
        }

        props.push(QApiPropInfo::try_from(property)?);
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
    use std::{
        collections::HashMap,
        fs::{File, create_dir_all},
        path::Path,
    };

    use crate::parser::{
        svelte::ParsedSvelteProp,
        types::{
            ParsedType, StandardType,
            interfaces::{InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        },
    };

    use super::*;

    fn fixture_file(root: &Path, relative: &str) -> String {
        let path = root.join(relative);

        create_dir_all(path.parent().expect("fixture has a parent")).expect("create fixture dir");
        File::create(&path).expect("create fixture file");

        path.to_string_lossy().into_owned()
    }

    #[test]
    fn rejects_unknown_protocol_versions() {
        let error = generate_response(DocgenRequest {
            version: PROTOCOL_VERSION + 1,
            components: Vec::new(),
        })
        .expect_err("version should be rejected");

        assert!(
            error
                .to_string()
                .contains("Unsupported docgen protocol version")
        );
    }

    #[test]
    fn rejects_relative_and_duplicate_inputs() {
        let relative = DocgenRequest {
            version: PROTOCOL_VERSION,
            components: vec![DocgenComponentInput {
                props_file: "relative/props.ts".to_string(),
                svelte_files: Vec::new(),
            }],
        };

        assert!(
            validate_request(&relative)
                .expect_err("relative path should be rejected")
                .to_string()
                .contains("absolute path")
        );

        let root = std::env::temp_dir().join(format!("quaff-docgen-ipc-{}", std::process::id()));
        let props = fixture_file(&root, "component/props.ts");
        let duplicate = DocgenRequest {
            version: PROTOCOL_VERSION,
            components: vec![
                DocgenComponentInput {
                    props_file: props.clone(),
                    svelte_files: Vec::new(),
                },
                DocgenComponentInput {
                    props_file: props,
                    svelte_files: Vec::new(),
                },
            ],
        };

        assert!(
            validate_request(&duplicate)
                .expect_err("duplicate should be rejected")
                .to_string()
                .contains("Duplicate docgen component")
        );
    }

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
    fn request_shape_rejects_unknown_fields() {
        let error = serde_json::from_str::<DocgenRequest>(
            r#"{"version":1,"components":[],"unexpected":true}"#,
        )
        .expect_err("unknown field should be rejected");

        assert!(error.to_string().contains("unknown field"));
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
}
