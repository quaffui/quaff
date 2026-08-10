use crate::{
    parser::types::interfaces::{InterfaceProperty, InterfacePropertyFlags},
    transformer::html::{ToHtml, model::QApiPropInfo},
};

use super::HtmlItem;

impl From<HtmlItem> for String {
    fn from(value: HtmlItem) -> Self {
        value.create_item()
    }
}

impl From<InterfaceProperty> for QApiPropInfo {
    fn from(mut prop: InterfaceProperty) -> Self {
        let Some(prop_comment) = prop.comment.take() else {
            panic!(
                "No description or default value found for property: {}. This shouldn't happen.",
                prop.name
            );
        };

        let prop_name = HtmlItem::new("")
            .tag("span")
            .class("q-docs-code q-mr-xs")
            .child(HtmlItem::new(&prop.name).tag("b"))
            .create_item();

        let mut prop_info_content = String::new();

        if prop.flags.contains(InterfacePropertyFlags::Optional) {
            prop_info_content.push_str("?");
        }

        prop_info_content.push_str(": ");
        prop_info_content.push_str(&prop.type_annotation.to_owned().to_html());

        if let Some(default) = prop_comment.default {
            prop_info_content.push_str(&HtmlItem::new(" = ").accent().create_item());

            let mut default_item = default;

            if prop.flags.contains(InterfacePropertyFlags::Bindable) {
                default_item.insert_str(0, &HtmlItem::new("$bindable(").accent().create_item());
                default_item.push_str(&HtmlItem::new(")").accent().create_item());
            }

            prop_info_content.push_str(&default_item);
        }

        let prop_info_html = HtmlItem::new(prop_info_content)
            .tag("pre")
            .class("prop-type")
            .create_item();

        let header = HtmlItem::new("")
            .tag("div")
            .class("q-api__doc-heading q-my-sm")
            .child(prop_name + &prop_info_html)
            .create_item();

        Self {
            header,
            description: prop_comment.description,
            is_snippet: prop.flags.contains(InterfacePropertyFlags::Snippet),
        }
    }
}
