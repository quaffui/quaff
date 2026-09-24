use oxc::ast::ast::{PropertyKey, TSInterfaceDeclaration, TSSignature, TSTypeLiteral};
use oxc_semantic::Semantic;

use crate::{
    extractor::{
        Extractor, comments::CommentInfo, generics::GenericBindings, heritage::HeritageParser,
    },
    parser::{
        svelte::parse_svelte_props_file,
        types::{ParsedType, StandardType, TypeParser, interfaces::InterfacePropertyKey},
    },
    prelude::*,
    resolver::{PathResolver, dependency::TypeRegistry},
    transformer::typescript::ToTs,
};

use super::{Interface, InterfaceParser, InterfaceProperty, InterfacePropertyFlags};

fn extract_undefined(parsed_type: ParsedType) -> (ParsedType, bool) {
    match parsed_type {
        ParsedType::Union(types) => {
            let (undefined_types, remaining): (Vec<_>, Vec<_>) = types
                .into_iter()
                .partition(|t| matches!(t, ParsedType::Standard(s) if s.name == "undefined"));

            if !undefined_types.is_empty() {
                let simplified = match remaining.len() {
                    0 => ParsedType::Standard(StandardType::new("undefined".to_string())),
                    1 => remaining.into_iter().next().unwrap(),
                    _ => ParsedType::Union(remaining),
                };

                (simplified, true)
            } else {
                (ParsedType::Union(remaining), false)
            }
        }
        ParsedType::Standard(ref s) if s.name == "undefined" => (parsed_type, true),
        other => (other, false),
    }
}

impl InterfacePropertyKey {
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
        }
    }
}

impl InterfaceParser for TSInterfaceDeclaration<'_> {
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

// Defaults travel with their properties so Pick/Omit and local declarations keep
// the same filtering and precedence as interface inheritance itself.
fn apply_component_defaults(
    interface_name: &str,
    properties: &mut [InterfaceProperty],
    resolver: &PathResolver,
) -> Result<()> {
    let Some(component_name) = interface_name.strip_suffix("Props") else {
        return Ok(());
    };
    let svelte_file = resolver
        .0
        .with_file_name(format!("{component_name}.svelte"));

    if !svelte_file.is_file() {
        return Ok(());
    }

    let defaults = parse_svelte_props_file(&svelte_file)?;

    for property in properties {
        if let InterfacePropertyKey::Identifier(name) = &property.key
            && let Some(default) = defaults.get(name).and_then(|prop| prop.default.as_ref())
        {
            property
                .comment
                .get_or_insert_with(CommentInfo::default)
                .default = Some(default.clone());
        }
    }

    Ok(())
}

fn parse_members(
    members: &[TSSignature<'_>],
    member_kind: &str,
    semantic: &Semantic,
    resolver: &PathResolver,
    generic_bindings: &GenericBindings,
    registry: &mut TypeRegistry,
) -> Result<Vec<InterfaceProperty>> {
    let mut props = Vec::new();

    for ts_signature in members {
        let prop_key;
        let type_annotation;
        let comment;
        let optional;

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
                comment = key.span.extract(semantic, resolver, registry)?;
                optional = prop.optional;

                let Some(annotation) = &prop.type_annotation else {
                    return Err(format!(
                        "Literal properties must have type annotations. Parsing property: {:#?}",
                        prop
                    )
                    .into());
                };

                type_annotation = annotation.type_annotation.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?;
            }
            TSSignature::TSIndexSignature(prop) => {
                let name = prop.parameter.name.to_string();
                let key_type = prop.parameter.type_annotation.type_annotation.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?;
                let value_type = prop.type_annotation.type_annotation.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?;

                comment = prop.span.extract(semantic, resolver, registry)?;

                let (cleaned_value_type, is_optional) = extract_undefined(value_type);

                prop_key = InterfacePropertyKey::IndexSignature {
                    name,
                    type_annotation: key_type,
                };
                type_annotation = cleaned_value_type;
                optional = is_optional;
            }
            _ => {
                return Err(format!("Unsupported {member_kind} member: {:?}", ts_signature).into());
            }
        }

        let parsed_prop = InterfaceProperty::new(prop_key, type_annotation, optional, comment);
        props.push(parsed_prop);
    }

    Ok(props)
}
