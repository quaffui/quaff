use oxc::ast::ast::{TSInterfaceDeclaration, TSTypeLiteral};
use oxc_semantic::Semantic;

use crate::{
    extractor::{CommentInfo, Extractor, GenericBindings, HeritageParser},
    parser::{InterfacePropertyKey, ParsedType},
    prelude::*,
    resolver::{PathResolver, TypeRegistry},
    transformer::ToTs,
};

use super::{
    Interface, InterfaceParser, InterfaceProperty, InterfacePropertyFlags,
    funcs::{apply_component_defaults, parse_members},
};

impl InterfacePropertyKey {
    /// Renders a property name or readable index-signature pattern for documentation.
    pub fn doc_name(&self) -> String {
        match self {
            Self::Identifier(name) => name.clone(),
            Self::IndexSignature {
                name,
                type_annotation,
            } => match type_annotation {
                ParsedType::TemplateLiteral(template) => {
                    let mut result = template.head.clone();

                    for span in &template.spans {
                        result.push('{');
                        result.push_str(&span.type_annotation.to_ts());
                        result.push('}');
                        result.push_str(&span.literal);
                    }

                    result
                }
                _ => format!("[{name}: {}]", type_annotation.to_ts()),
            },
        }
    }
}

impl InterfaceProperty {
    /// Creates a property with its parsed annotation and optionality flag.
    pub fn new(
        key: InterfacePropertyKey,
        type_annotation: ParsedType,
        optional: bool,
        comment: Option<CommentInfo>,
    ) -> Self {
        Self {
            key,
            type_annotation,
            flags: if optional {
                InterfacePropertyFlags::OPTIONAL
            } else {
                InterfacePropertyFlags::NONE
            },
            comment,
        }
    }
}

impl InterfaceParser for TSInterfaceDeclaration<'_> {
    /// Parses inherited properties, generic parameters, and component defaults.
    fn parse(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<Interface> {
        let name = self.id.name.to_string();

        let mut generics = Vec::new();

        if let Some(params) = &self.type_parameters {
            generics = params.extract(semantic, resolver, registry)?;
        }

        let generic_bindings = generic_bindings.with_missing_generics(&generics);
        let heritage =
            self.extends
                .parse_heritage(semantic, resolver, &generic_bindings, registry)?;
        let mut properties = self.parse_body(semantic, resolver, &generic_bindings, registry)?;

        for property in heritage.herited_props {
            if !properties
                .iter()
                .any(|own| own.key.doc_name() == property.key.doc_name())
            {
                properties.push(property);
            }
        }

        apply_component_defaults(&name, &mut properties, resolver)?;

        Ok(Interface {
            name,
            properties,
            generics,
            dom_props_heritage: heritage.dom.map(Box::new),
        })
    }

    /// Parses declared members using the shared property and index-signature parser.
    fn parse_body(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<Vec<InterfaceProperty>> {
        parse_members(
            &self.body.body,
            "interface",
            semantic,
            resolver,
            generic_bindings,
            registry,
        )
    }
}

impl InterfaceParser for TSTypeLiteral<'_> {
    /// Parses declared members using the shared property and index-signature parser.
    fn parse_body(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<Vec<InterfaceProperty>> {
        parse_members(
            &self.members,
            "literal",
            semantic,
            resolver,
            generic_bindings,
            registry,
        )
    }
}

#[cfg(test)]
impl crate::test_support::Fixture {
    /// Parses a fixture props file relative to its generated directory.
    pub(super) fn parse(
        &self,
        name: &str,
    ) -> Result<std::collections::BTreeMap<String, crate::parser::ParsedPropsInterface>> {
        use crate::parser::TSPropsParser;

        let path = self.0.join(name);
        path.parse_props(&PathResolver(&path))
    }
}
