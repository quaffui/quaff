use crate::{
    Result,
    parser::{
        svelte::MethodInfo,
        types::{
            interfaces::{InterfaceProperty, InterfacePropertyFlags},
            snippets::Snippet,
        },
    },
    transformer::html::{ToHtml, model::QApiPropInfo},
};

use super::HtmlItem;

impl From<HtmlItem> for String {
    fn from(value: HtmlItem) -> Self {
        value.create_item()
    }
}

fn entry_header(name: &str, type_content: String) -> String {
    let prop_name = HtmlItem::prop_name(name);
    let type_info = HtmlItem::new("")
        .tag("pre")
        .class("prop-type")
        .child_html(type_content)
        .create_item();

    HtmlItem::new("")
        .tag("div")
        .class("q-api__doc-heading q-my-sm")
        .child_html(prop_name + &type_info)
        .create_item()
}

impl From<Snippet> for QApiPropInfo {
    fn from(value: Snippet) -> Self {
        let params_info = if value.params.is_empty() {
            if value.optional {
                HtmlItem::new("?.()").create_item()
            } else {
                HtmlItem::new("()").create_item()
            }
        } else {
            let mut params_info = if value.optional {
                HtmlItem::new("?.({ ").create_item()
            } else {
                HtmlItem::new("({ ").create_item()
            };
            params_info.push_str(&value.params.to_html());
            params_info.push_str(&HtmlItem::new(" })").create_item());
            params_info
        };

        Self {
            header: entry_header(&value.name, params_info),
            name: value.name,
            description: value.description,
        }
    }
}

impl From<MethodInfo> for QApiPropInfo {
    fn from(value: MethodInfo) -> Self {
        let type_html = value.function_type.to_html();

        Self {
            header: entry_header(&value.name, type_html),
            name: value.name,
            description: value.description,
        }
    }
}

impl TryFrom<InterfaceProperty> for QApiPropInfo {
    type Error = Box<dyn std::error::Error>;

    fn try_from(mut prop: InterfaceProperty) -> Result<Self> {
        let name = prop.key.doc_name();
        let prop_comment = prop.comment.take().unwrap_or_default();
        let mut prop_info_content = String::new();

        if prop.flags.contains(InterfacePropertyFlags::Optional) {
            prop_info_content.push_str(&HtmlItem::new("?").create_item());
        }

        prop_info_content.push_str(&HtmlItem::new(": ").create_item());
        prop_info_content.push_str(&prop.type_annotation.to_html());

        if let Some(default) = prop_comment.default {
            prop_info_content.push_str(&HtmlItem::new(" = ").accent().create_item());

            if prop.flags.contains(InterfacePropertyFlags::Bindable) {
                prop_info_content.push_str(&HtmlItem::new("$bindable(").accent().create_item());
            }

            prop_info_content.push_str(&HtmlItem::new(default).create_item());

            if prop.flags.contains(InterfacePropertyFlags::Bindable) {
                prop_info_content.push_str(&HtmlItem::new(")").accent().create_item());
            }
        }

        Ok(Self {
            header: entry_header(&name, prop_info_content),
            name,
            description: prop_comment.description,
        })
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::{
        extractor::comments::CommentInfo,
        parser::types::snippets::Snippet,
        parser::types::{
            ParsedType, StandardType,
            interfaces::{InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        },
        transformer::html::QApiPropInfo,
    };

    #[test]
    fn escapes_property_headers_but_preserves_description_html() {
        let property = InterfaceProperty {
            key: InterfacePropertyKey::Identifier("unsafe<name>".to_string()),
            type_annotation: ParsedType::Standard(StandardType {
                name: r#""<value>""#.to_string(),
            }),
            flags: InterfacePropertyFlags::Optional,
            comment: Some(CommentInfo {
                description: "Use <code>trusted</code>.".to_string(),
                default: Some("<script>alert('bad')</script>".to_string()),
            }),
        };

        let info = QApiPropInfo::try_from(property).expect("property should render");

        assert_eq!(info.name, "unsafe<name>");
        assert_eq!(info.description, "Use <code>trusted</code>.");
        assert!(info.header.contains("unsafe&lt;name&gt;"));
        assert!(info.header.contains("&quot;&lt;value&gt;&quot;"));
        assert!(
            info.header
                .contains("&lt;script&gt;alert(&#39;bad&#39;)&lt;/script&gt;")
        );
        assert!(!info.header.contains("<script>"));
    }

    #[test]
    fn renders_empty_and_named_snippet_parameters() {
        let empty = QApiPropInfo::from(Snippet {
            name: "empty".to_string(),
            optional: true,
            description: String::new(),
            params: HashMap::new(),
        });
        let named = QApiPropInfo::from(Snippet {
            name: "named".to_string(),
            optional: false,
            description: String::new(),
            params: HashMap::from([
                (
                    "zeta".to_string(),
                    ParsedType::Standard(StandardType {
                        name: "number".to_string(),
                    }),
                ),
                (
                    "alpha".to_string(),
                    ParsedType::Standard(StandardType {
                        name: "string".to_string(),
                    }),
                ),
            ]),
        });

        assert!(empty.header.contains("?.()"));
        assert!(!empty.header.contains("{  }"));
        assert!(named.header.contains("({ alpha: string, zeta: number })"));
    }

    #[test]
    fn renders_index_signature_property_with_template_literal_name() {
        let property = InterfaceProperty {
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
        };

        let info = QApiPropInfo::try_from(property).expect("index signature prop");

        assert_eq!(info.name, "bodyCell{string}");
        assert!(info.header.contains("<b>bodyCell{string}</b>"));
        assert!(info.header.contains("?: "));
    }
}
