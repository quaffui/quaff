use crate::{
    Result,
    parser::{InterfaceProperty, InterfacePropertyFlags, MethodInfo, Snippet},
    transformer::{QApiPropInfo, ToHtml},
};

use super::{HtmlItem, funcs::entry_header};

impl From<HtmlItem> for String {
    fn from(value: HtmlItem) -> Self {
        value.create_item()
    }
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
    type Error = crate::Error;

    fn try_from(mut prop: InterfaceProperty) -> Result<Self> {
        let name = prop.key.doc_name();
        let prop_comment = prop.comment.take().unwrap_or_default();
        let mut prop_info_content = String::new();

        if prop.flags.contains(InterfacePropertyFlags::OPTIONAL) {
            prop_info_content.push_str(&HtmlItem::new("?").create_item());
        }

        prop_info_content.push_str(&HtmlItem::new(": ").create_item());
        prop_info_content.push_str(&prop.type_annotation.to_html());

        if let Some(default) = prop_comment.default {
            prop_info_content.push_str(&HtmlItem::new(" = ").accent().create_item());

            if prop.flags.contains(InterfacePropertyFlags::BINDABLE) {
                prop_info_content.push_str(&HtmlItem::new("$bindable(").accent().create_item());
            }

            prop_info_content.push_str(&HtmlItem::new(default).create_item());

            if prop.flags.contains(InterfacePropertyFlags::BINDABLE) {
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
