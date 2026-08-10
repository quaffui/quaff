use oxc::ast::ast::{PropertyKey, TSInterfaceDeclaration, TSSignature, TSTypeLiteral};
use oxc_semantic::Semantic;

use crate::{
    extractor::{Extractor, comments::CommentInfo, generics::GenericInfo},
    parser::types::{ParsedType, TypeDependencies, TypeParser, interfaces::InterfacePropertyKey},
    prelude::*,
    resolver::PathResolver,
};

use super::{Interface, InterfaceParser, InterfaceProperty, InterfacePropertyFlags};

impl InterfaceProperty {
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
                InterfacePropertyFlags::Optional
            } else {
                InterfacePropertyFlags::None
            },
            comment,
            type_args: vec![],
        }
    }

    pub fn with_type_args(mut self, type_args: &[ParsedType]) -> Self {
        self.type_args = type_args.to_vec();
        self
    }
}

impl InterfaceParser for TSInterfaceDeclaration<'_> {
    fn parse(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        type_args: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<Interface> {
        let name = self.id.name.to_string();

        let mut generics = Vec::new();

        if let Some(params) = &self.type_parameters {
            generics = params.extract(semantic, resolver, type_deps)?;
        }

        let heritage = self.extends.extract(semantic, resolver, type_deps)?;
        let mut properties =
            self.parse_body(semantic, resolver, &generics, type_args, type_deps)?;

        properties.extend(heritage.herited_props);

        Ok(Interface {
            name,
            properties,
            generics,
            dom_props_heritage: heritage.dom.map(Box::new),
        })
    }

    fn parse_body(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_args: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<Vec<InterfaceProperty>> {
        let mut props = Vec::new();

        for ts_signature in &self.body.body {
            let prop_key;
            let type_annotation;
            let mut comment = None;
            let mut optional = false;

            match ts_signature {
                TSSignature::TSPropertySignature(prop) => {
                    let PropertyKey::StaticIdentifier(key) = &prop.key else {
                        return Err(format!(
                            "Literal properties must be identifiers. Parsing property: {:?}",
                            prop
                        )
                        .into());
                    };

                    prop_key = InterfacePropertyKey::Identifier(key.name.to_string());
                    comment = key.span.extract(semantic, resolver, type_deps)?;
                    optional = prop.optional;

                    let Some(annotation) = &prop.type_annotation else {
                        return Err(format!(
                            "Literal properties must have type annotations. Parsing property: {:#?}",
                            prop
                        )
                        .into());
                    };

                    type_annotation = annotation
                        .type_annotation
                        .parse_type(semantic, resolver, generics, type_args, type_deps)?;
                }
                TSSignature::TSIndexSignature(prop) => {
                    let name = prop.parameter.name.to_string();
                    let key_type = prop
                        .parameter
                        .type_annotation
                        .type_annotation
                        .parse_type(semantic, resolver, generics, type_args, type_deps)?;
                    let value_type = prop
                        .type_annotation
                        .type_annotation
                        .parse_type(semantic, resolver, generics, type_args, type_deps)?;

                    prop_key = InterfacePropertyKey::IndexSignature {
                        name,
                        type_annotation: key_type,
                    };
                    type_annotation = value_type;
                }
                _ => {
                    return Err(format!("Unsupported interface member: {:?}", ts_signature).into());
                }
            }

            let parsed_prop = InterfaceProperty::new(prop_key, type_annotation, optional, comment)
                .with_type_args(type_args);
            props.push(parsed_prop);
        }

        Ok(props)
    }
}

impl InterfaceParser for TSTypeLiteral<'_> {
    fn parse_body(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_args: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<Vec<InterfaceProperty>> {
        let mut props = Vec::new();

        for prop in &self.members {
            let prop_key;
            let type_annotation;
            let mut comment = None;
            let mut optional = false;

            match prop {
                TSSignature::TSPropertySignature(prop) => {
                    let PropertyKey::StaticIdentifier(key) = &prop.key else {
                        return Err(format!(
                            "Literal properties must be identifiers. Parsing property: {:?}",
                            prop
                        )
                        .into());
                    };

                    prop_key = InterfacePropertyKey::Identifier(key.name.to_string());
                    comment = key.span.extract(semantic, resolver, type_deps)?;
                    optional = prop.optional;

                    let Some(annotation) = &prop.type_annotation else {
                        return Err(format!(
                            "Literal properties must have type annotations. Parsing property: {:#?}",
                            prop
                        )
                        .into());
                    };

                    type_annotation = annotation
                        .type_annotation
                        .parse_type(semantic, resolver, generics, type_args, type_deps)?;
                }
                TSSignature::TSIndexSignature(prop) => {
                    let name = prop.parameter.name.to_string();
                    let key_type = prop
                        .parameter
                        .type_annotation
                        .type_annotation
                        .parse_type(semantic, resolver, generics, type_args, type_deps)?;
                    let value_type = prop
                        .type_annotation
                        .type_annotation
                        .parse_type(semantic, resolver, generics, type_args, type_deps)?;

                    prop_key = InterfacePropertyKey::IndexSignature {
                        name,
                        type_annotation: key_type,
                    };
                    type_annotation = value_type;
                }
                _ => {
                    return Err(format!("Unsupported literal member: {:?}", prop).into());
                }
            }

            let parsed_prop = InterfaceProperty::new(prop_key, type_annotation, optional, comment);
            props.push(parsed_prop);
        }

        Ok(props)
    }
}
