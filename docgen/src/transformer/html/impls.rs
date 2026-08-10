use std::{collections::HashMap, fmt::Display};

use crate::{
    extractor::generics::GenericInfo,
    parser::types::{
        ExternalType, ParsedType, ReferenceType, StandardType,
        functions::FunctionType,
        interfaces::{Interface, InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey},
        ts_utilities::UtilityTKind,
    },
};

use super::{HtmlItem, ToHtml};

impl Default for HtmlItem {
    fn default() -> Self {
        Self {
            content: String::new(),
            accent: false,
            is_reference: false,
            type_name: String::new(),
            type_src: String::new(),
            class: None,
            tag: None,
        }
    }
}

impl Display for HtmlItem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.create_item())
    }
}

impl HtmlItem {
    pub fn new(content: impl Into<String>) -> Self {
        Self {
            content: content.into(),
            ..Default::default()
        }
    }

    pub fn prop_name(name: &str) -> String {
        Self::new("")
            .tag("span")
            .class("q-docs-code q-mr-xs")
            .child(Self::new(name).tag("b"))
            .create_item()
    }

    pub fn accent(mut self) -> Self {
        self.accent = true;
        self
    }

    pub fn reference(mut self) -> Self {
        self.is_reference = true;
        self
    }

    pub fn type_name(mut self, name: impl Into<String>) -> Self {
        self.type_name = name.into();
        self
    }

    pub fn type_src(mut self, src: impl Into<String>) -> Self {
        self.type_src = src.into();
        self
    }

    pub fn class(mut self, class: impl Into<String>) -> Self {
        self.class = Some(class.into());
        self
    }

    pub fn tag(mut self, tag: impl Into<String>) -> Self {
        self.tag = Some(tag.into());
        self
    }

    pub fn child(mut self, content: impl Into<String>) -> Self {
        self.content = content.into();
        self
    }

    pub fn create_item(&self) -> String {
        let mut classes = vec![];
        let mut attrs = vec![];
        let mut tag = self.tag.as_deref();

        let type_name_attr = format!(r#"data-type-name="{}""#, self.type_name);
        let href_attr = format!(r#"href="{}""#, self.type_src);

        if let Some(class) = &self.class {
            classes.push(class.as_str());
        } else {
            if self.accent {
                tag = Some("span".into());
                classes.push("accented");
            }

            if self.is_reference {
                tag = Some("span".into());
                classes.push("clickable");
                attrs.extend_from_slice(&["data-quaff", &type_name_attr]);
            }

            if !self.type_src.is_empty() {
                tag = Some("a".into());
                classes.push("clickable link");
                attrs.extend_from_slice(&[&href_attr, r#"target="_blank""#]);
            }
        }

        let classes_string = if classes.is_empty() {
            String::new()
        } else {
            format!(" class=\"{}\"", classes.join(" "))
        };

        let attrs_string = Self::prepare_attr_str(&attrs);

        match tag {
            Some(tag) => format!(
                "<{tag}{classes_string}{attrs_string}>{}</{tag}>",
                self.content
            ),
            None => self.content.to_string(),
        }
    }

    fn prepare_attr_str(vec: &Vec<&str>) -> String {
        let mut attr_string = vec.join(" ");

        if !attr_string.is_empty() {
            attr_string.insert(0, ' ');
        }

        attr_string
    }
}

impl ToHtml for StandardType {
    fn to_html(self) -> String {
        HtmlItem::new(self.name).to_string()
    }
}

impl ToHtml for ExternalType {
    fn to_html(self) -> String {
        HtmlItem::new(self.name).type_src(self.type_src).to_string()
    }
}

impl ToHtml for ReferenceType {
    fn to_html(self) -> String {
        HtmlItem::new(&self.name)
            .reference()
            .type_name(self.name)
            .to_string()
    }
}

impl ToHtml for HashMap<String, ParsedType> {
    fn to_html(self) -> String {
        self.into_iter()
            .map(|(key, value)| format!("{}: {}", key, value.to_html()))
            .collect::<Vec<String>>()
            .join(", ")
    }
}

impl ToHtml for Vec<InterfaceProperty> {
    fn to_html(self) -> String {
        let mapped = self
            .into_iter()
            .map(|prop| {
                let opt_str = if prop.flags.contains(InterfacePropertyFlags::Optional) {
                    "?"
                } else {
                    ""
                };
                format!(
                    "{}{}: {}",
                    prop.key.to_html(),
                    opt_str,
                    prop.type_annotation.to_html()
                )
            })
            .collect::<Vec<String>>()
            .join(", ");

        format!("{{ {mapped} }}")
    }
}

impl ToHtml for InterfacePropertyKey {
    fn to_html(self) -> String {
        match self {
            Self::Identifier(name) => name.to_string(),
            Self::IndexSignature {
                name,
                type_annotation,
            } => format!("[{}: {}]", name, type_annotation.to_html()),
        }
    }
}

impl ToHtml for Interface {
    fn to_html(self) -> String {
        let mut generics = String::new();
        if !self.generics.is_empty() {
            generics.push('<');
            generics.push_str(
                &self
                    .generics
                    .into_iter()
                    .map(GenericInfo::to_html)
                    .collect::<Vec<String>>()
                    .join(", "),
            );
            generics.push('>');
        }

        let props = self
            .properties
            .into_iter()
            .map(|p| format!("{}: {}", p.key.to_html(), p.type_annotation.to_html()))
            .collect::<Vec<String>>()
            .join(", ");

        format!("interface {}{}{{{}}}", self.name, generics, props)
    }
}

impl ToHtml for FunctionType {
    fn to_html(self) -> String {
        let mut generics = String::new();

        if !self.generics.is_empty() {
            generics.push('<');
            generics.push_str(
                &self
                    .generics
                    .into_iter()
                    .map(GenericInfo::to_html)
                    .collect::<Vec<String>>()
                    .join(", "),
            );
            generics.push('>');
        }

        let params = self
            .params
            .into_iter()
            .map(|p| {
                let opt_str = if p.optional { "?" } else { "" };

                format!("{}{}: {}", p.name, opt_str, p.type_annotation.to_html())
            })
            .collect::<Vec<String>>()
            .join(", ");

        format!("{}({}) => {}", generics, params, self.return_type.to_html())
    }
}

impl ToHtml for ParsedType {
    fn needs_html_braces(&self) -> bool {
        matches!(
            self,
            Self::Union(_) | Self::Intersection(_) | Self::Function(_)
        )
    }

    fn to_html(self) -> String {
        match self {
            Self::Union(_) => self.to_html_joined(" | "),
            Self::Intersection(_) => self.to_html_joined(" & "),
            Self::Standard(inner) => inner.to_html(),
            Self::External(inner) => inner.to_html(),
            Self::Reference(inner) => inner.to_html(),
            Self::Snippet(inner) => inner.to_html(),
            Self::Interface(inner) => inner.to_html(),
            Self::TypeLiteral(inner) => inner.to_html(),
            Self::Function(inner) => inner.to_html(),
            Self::UtilityT { kind, t } => match kind {
                UtilityTKind::Array => {
                    if t.needs_html_braces() {
                        format!("({})[]", t.to_html())
                    } else {
                        format!("{}[]", t.to_html())
                    }
                }
                _ => format!("{}<{}>", kind, t.to_html()),
            },
            Self::UtilityKV { kind, k, v } => format!("{}<{}, {}>", kind, k.to_html(), v.to_html()),
        }
    }
}
