use std::{collections::HashMap, fmt::Display};

use bitflags::bitflags;
use oxc::ast::ast::{TSInterfaceDeclaration, TSTypeAliasDeclaration, VariableDeclarator};
use oxc_semantic::Semantic;

use crate::defs::{
    FunctionType, InterfaceProperty, InterfaceType,
    ParsedType::UtilityT,
    enums::{UtilityKVKind, UtilityTKind},
};

use super::structs::{ExternalType, ReferenceType, StandardType};

pub trait ToHtml {
    fn to_html(self) -> String;

    fn to_html_joined(self, joiner: &str) -> String
    where
        Self: Sized + IntoIterator<Item = Self> + ToHtml,
    {
        self.into_iter()
            .map(|t| {
                if t.needs_html_braces() {
                    format!("({})", t.to_html())
                } else {
                    t.to_html()
                }
            })
            .collect::<Vec<String>>()
            .join(&format!(" {} ", joiner))
    }

    fn needs_html_braces(&self) -> bool {
        false
    }
}

bitflags! {
    /// Flags indicating the property's characteristics
    #[derive(Debug, Clone)]
    pub struct ParsedPropertyFlags: u8 {
        /// No flags set
        const None = 0;
        /// The property is marked as optional with `?`
        const Optional = 1 << 0;
        /// The property's type is a Svelte `Snippet`
        const Snippet = 1 << 1;
        /// The property is bindable (e.g. `$bindable` in the `$props` declaration)
        const Bindable = 1 << 2;
    }
}

/// A parsed type. Can be standard, external or complex.
#[derive(Debug, Clone)]
pub enum ParsedType {
    /// An external type, see [ExternalType] for more information
    External(ExternalType),
    /// A standard type, see [StandardType] for more information
    Standard(StandardType),
    /// A complex type, see [ComplexType] for more information
    Reference(ReferenceType),
    /// A TS utility type with one type argument, e.g. `Partial<T>`
    UtilityT {
        kind: UtilityTKind,
        t: Box<ParsedType>,
    },
    /// A TS utility type with two type arguments, e.g. `Record<K, V>`
    UtilityKV {
        kind: UtilityKVKind,
        k: Box<ParsedType>,
        v: Box<ParsedType>,
    },
    /// An interface type, see [InterfaceType] for more information
    Interface(InterfaceType),
    /// A type literal, which is just an inline interface, without a name or generics.
    /// It can be represented as a vec of properties.
    TypeLiteral(Vec<InterfaceProperty>),
    /// A function type, see [FunctionType] for more information
    Function(Box<FunctionType>),
    /// A union of [ParsedType]. The vector will always contain more than one element.
    Union(Vec<ParsedType>),
    /// An intersection of [ParsedType]. The vector will always contain more than one element.
    Intersection(Vec<ParsedType>),
}

impl IntoIterator for ParsedType {
    type Item = Self;

    type IntoIter = std::vec::IntoIter<Self>;

    fn into_iter(self) -> Self::IntoIter {
        match self {
            Self::Union(types) | Self::Intersection(types) => types.into_iter(),
            _ => panic!("Called into_iter() on a non-union/non-intersection ParsedType"),
        }
    }
}

struct HtmlItem {
    content: String,
    accent: bool,
    is_reference: bool,
    type_name: String,
    type_src: String,
    class: Option<String>,
    tag: Option<String>,
}

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

impl HtmlItem {
    fn new(content: impl Into<String>) -> Self {
        Self {
            content: content.into(),
            ..Default::default()
        }
    }

    fn accent(mut self) -> Self {
        self.accent = true;
        self
    }

    fn reference(mut self) -> Self {
        self.is_reference = true;
        self
    }

    fn type_name(mut self, name: impl Into<String>) -> Self {
        self.type_name = name.into();
        self
    }

    fn type_src(mut self, src: impl Into<String>) -> Self {
        self.type_src = src.into();
        self
    }

    fn class(mut self, class: impl Into<String>) -> Self {
        self.class = Some(class.into());
        self
    }

    fn tag(mut self, tag: impl Into<String>) -> Self {
        self.tag = Some(tag.into());
        self
    }

    fn create_item(&self) -> String {
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
                classes.push("link");
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

    fn child(mut self, content: impl Into<String>) -> Self {
        self.content = content.into();
        self
    }

    fn prepare_attr_str(vec: &Vec<&str>) -> String {
        let mut attr_string = vec.join(" ");

        if !attr_string.is_empty() {
            attr_string.insert(0, ' ');
        }

        attr_string
    }
}

impl Display for HtmlItem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.create_item())
    }
}

impl From<HtmlItem> for String {
    fn from(value: HtmlItem) -> Self {
        value.create_item()
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
            Self::Intersection(_) => self.to_html_joined("&"),
            Self::Union(_) => self.to_html_joined("|"),
            Self::Standard(inner) => HtmlItem::new(inner.name).to_string(),
            Self::External(inner) => HtmlItem::new(inner.name)
                .reference()
                .type_src(inner.type_src)
                .to_string(),
            Self::Reference(inner) => HtmlItem::new(&inner.name)
                .reference()
                .type_name(inner.name)
                .to_string(),
            Self::TypeLiteral(props) => {
                let mapped = props
                    .into_iter()
                    .map(|p| format!("{}: {}", p.name, p.type_annotation.to_html()))
                    .collect::<Vec<String>>()
                    .join(", ");
                format!("{{{}}}", mapped)
            }
            Self::Interface(inner) => {
                let mut generics = String::new();
                if !inner.generics.is_empty() {
                    generics.push('<');
                    generics.push_str(
                        &inner
                            .generics
                            .into_iter()
                            .map(ParsedGeneric::to_html)
                            .collect::<Vec<String>>()
                            .join(", "),
                    );
                    generics.push('>');
                }

                let props = inner
                    .properties
                    .into_iter()
                    .map(|p| format!("{}: {}", p.name, p.type_annotation.to_html()))
                    .collect::<Vec<String>>()
                    .join(", ");

                format!("interface {}{}{{{}}}", inner.name, generics, props)
            }
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
            Self::Function(inner) => {
                let mut generics = String::new();

                if !inner.generics.is_empty() {
                    generics.push('<');
                    generics.push_str(
                        &inner
                            .generics
                            .into_iter()
                            .map(ParsedGeneric::to_html)
                            .collect::<Vec<String>>()
                            .join(", "),
                    );
                    generics.push('>');
                }

                let params = inner
                    .params
                    .into_iter()
                    .map(|p| format!("{}: {}", p.name, p.type_annotation.to_html()))
                    .collect::<Vec<String>>()
                    .join(", ");

                format!(
                    "{}({}) => {}",
                    generics,
                    params,
                    inner.return_type.to_html()
                )
            }
        }
    }
}

/// Type dependencies associated with a given type.
/// The key is the given type's name, and the value an array of its dependencies.
pub type TypeDependencies = HashMap<String, Vec<ParsedType>>;

/// Represents a generic type parameter of an interface (e.g. `<T extends string>`).
#[derive(Debug, Clone)]
pub struct ParsedGeneric {
    /// Name of the generic type parameter (e.g. "T")
    pub name: String,
    /// Constraint text if the generic extends a type (e.g. "string")
    pub constraint: Option<ParsedType>,
    /// Default value if the generic has one (e.g. "T = string")
    pub default: Option<ParsedType>,
}

impl ToHtml for ParsedGeneric {
    fn to_html(self) -> String {
        let mut vec_result = vec![self.name];

        if let Some(constraint) = self.constraint {
            vec_result.push("extends".to_string());
            vec_result.push(constraint.to_html());
        }

        if let Some(default) = self.default {
            vec_result.push("=".to_string());
            vec_result.push(default.to_html());
        }

        vec_result.join(" ")
    }
}

/// Represents the heritage clauses of an interface (e.g. `extends Clickable, HTMLAttributes<...>`)
pub struct ParsedHeritage {
    /// The DOM attributes constraint if the interface extends `HTMLAttributes<...>` or similar
    pub dom: Option<ParsedType>,
    /// A collection of properties from interfaces that the current interface extends, excluding DOM attributes and the like.
    pub herited_props: ParsedProps,
}

/// Represents the JSDoc documentation for a property.
#[derive(Debug, Clone)]
pub struct ParsedComment {
    /// The JSDoc description explaining the property's purpose
    pub description: String,
    /// The default value from the `@default` JSDoc tag, if present
    /// NOTE: This can be later overriden by a Svelte $props default value.
    pub default: Option<String>,
}

/// Represents a single parsed property from an interface.
#[derive(Debug, Clone)]
pub struct ParsedProp {
    /// The property's identifier name (e.g. "disabled", "icon")
    pub name: String,
    /// The JSDoc description explaining the property's purpose
    pub description: String,
    /// Flags indicating the property's characteristics (see [ParsedPropertyFlags])
    pub flags: ParsedPropertyFlags,
    /// The computed type of this property.
    pub type_def: ParsedType,
    /// The default value from the `@default` JSDoc tag, if present
    pub default: Option<String>,
}

impl From<ParsedProp> for QApiPropInfo {
    fn from(prop: ParsedProp) -> Self {
        let prop_name = HtmlItem::new("")
            .tag("span")
            .class("q-docs-code q-mr-xs")
            .child(HtmlItem::new(prop.name).tag("b"))
            .create_item();

        let mut prop_info_content = String::new();

        if prop.flags.contains(ParsedPropertyFlags::Optional) {
            prop_info_content.push_str("?");
        }

        prop_info_content.push_str(": ");
        prop_info_content.push_str(&prop.type_def.to_html());

        if let Some(default) = prop.default {
            prop_info_content.push_str(&HtmlItem::new(" = ").accent().create_item());

            let mut default_item = default;

            if prop.flags.contains(ParsedPropertyFlags::Bindable) {
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
            description: prop.description,
            is_snippet: prop.flags.contains(ParsedPropertyFlags::Snippet),
        }
    }
}

#[derive(Debug)]
pub struct QApiPropInfo {
    /// The html content of the header, with the prop name, default and type definition
    pub header: String,
    /// The description of the property
    pub description: String,
    /// Whether the property is a snippet
    pub is_snippet: bool,
}

/// A map of property names to their parsed information.
/// It allows overriding earlier ones, matching the behaviour of TypeScript's type merging.
pub type ParsedProps = HashMap<String, ParsedProp>;

/// Represents a fully parsed TypeScript interface.
#[derive(Debug)]
pub struct ParsedPropsInterface {
    /// The DOM attributes the interface extends, such as `HTMLAttributes<...>` or similar.
    pub dom_attrs_heritage: Option<ParsedType>,
    /// The interface's generic type parameters.
    pub generics: Vec<ParsedGeneric>,
    /// All parsed properties, including those inherited from extended internal interfaces.
    pub properties: ParsedProps,
    /// The resolved type dependencies for the interface.
    pub type_dependencies: HashMap<String, Vec<ParsedType>>,
}

#[derive(Debug)]
pub enum ParsedDefault {
    /// The default value from the Svelte `$props` declaration (e.g. `{ myProp = false }`)
    Value(Option<String>),
    /// The property is bindable in the `$props` declaration (e.g. `{ myProp = $bindable(false) }`)
    Bindable(Option<String>),
}

impl ParsedDefault {
    /// Returns the inner value
    fn inner(&self) -> &Option<String> {
        match self {
            Self::Value(val) => val,
            Self::Bindable(val) => val,
        }
    }

    /// Returns `true` if the property is bindable in the `$props` declaration
    pub fn is_bindable(&self) -> bool {
        matches!(self, Self::Bindable(_))
    }

    /// Returns the default value of the property
    pub fn value(&self) -> String {
        self.inner().as_deref().unwrap_or("undefined").to_string()
    }
}

/// Information about a property's default value and bindable status, derived from the component's Svelte file.
///
/// Used to enrich the [ParsedProperty] type.
pub type ParsedDefaults = HashMap<String, ParsedDefault>;

/// An enum of AstKind variants that can be resolved from a reference.
pub enum ResolvedReference<'a> {
    /// A reference to a variable declarator.
    VariableDeclarator(&'a VariableDeclarator<'a>, &'a Semantic<'a>),
    /// A reference to a type alias declaration.
    TSTypeAliasDeclaration(&'a TSTypeAliasDeclaration<'a>, &'a Semantic<'a>),
    /// A reference to an interface declaration.
    TSInterfaceDeclaration(&'a TSInterfaceDeclaration<'a>, &'a Semantic<'a>),
}

impl<'a> std::fmt::Debug for ResolvedReference<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TSInterfaceDeclaration(decl, _) => decl.fmt(f),
            Self::TSTypeAliasDeclaration(decl, _) => decl.fmt(f),
            Self::VariableDeclarator(decl, _) => decl.fmt(f),
        }
    }
}
