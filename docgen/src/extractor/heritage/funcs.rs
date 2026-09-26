use crate::{
    Result,
    parser::{
        InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey, ParsedType, StandardType,
        UtilityKVKind,
    },
};

use super::models::InheritedProperties;

/// Collects inherited properties and DOM constraints, including Pick and Omit filters.
pub(super) fn inherited_properties(parsed: ParsedType) -> Result<InheritedProperties> {
    match parsed {
        ParsedType::Interface(interface) => {
            Ok((interface.properties, interface.dom_props_heritage))
        }
        ParsedType::TypeLiteral(properties) => Ok((properties, None)),
        ParsedType::External(external) => {
            Ok((Vec::new(), Some(Box::new(ParsedType::External(external)))))
        }
        ParsedType::Intersection(types) => {
            let mut properties: Vec<InterfaceProperty> = Vec::new();
            let mut dom = None;

            for parsed in types {
                let (inherited, inherited_dom) = inherited_properties(parsed)?;

                for property in inherited {
                    if let Some(existing) = properties
                        .iter_mut()
                        .find(|existing| existing.key.doc_name() == property.key.doc_name())
                    {
                        existing.type_annotation = ParsedType::Intersection(vec![
                            existing.type_annotation.clone(),
                            property.type_annotation,
                        ]);

                        if !property.flags.contains(InterfacePropertyFlags::OPTIONAL) {
                            existing.flags.remove(InterfacePropertyFlags::OPTIONAL);
                        }

                        existing.comment = existing.comment.take().or(property.comment);
                    } else {
                        properties.push(property);
                    }
                }

                dom = inherited_dom.or(dom);
            }

            Ok((properties, dom))
        }
        ParsedType::Reference(reference) => inherited_properties(*reference.parsed),
        ParsedType::UtilityKV {
            kind: kind @ (UtilityKVKind::Pick | UtilityKVKind::Omit),
            k,
            v,
        } => {
            let (mut properties, dom) = inherited_properties(*k)?;
            let mut keys = property_keys(*v.clone())?;
            properties.retain(|property| {
                let is_selected = matches!(&property.key,
                    InterfacePropertyKey::Identifier(name) if keys.contains(name));

                is_selected == (kind == UtilityKVKind::Pick)
            });
            let dom = dom.and_then(|dom| {
                let keys = if kind == UtilityKVKind::Pick {
                    keys.retain(|key| {
                        !properties
                            .iter()
                            .any(|property| property.key.doc_name() == *key)
                    });

                    if keys.is_empty() {
                        return None;
                    }

                    Box::new(ParsedType::Union(
                        keys.into_iter()
                            .map(|key| ParsedType::Standard(StandardType::new(format!("{key:?}"))))
                            .collect(),
                    ))
                } else {
                    v
                };

                Some(Box::new(ParsedType::UtilityKV {
                    kind,
                    k: dom,
                    v: keys,
                }))
            });

            Ok((properties, dom))
        }
        other => Err(format!("Unsupported interface heritage type: {other:?}").into()),
    }
}

/// Extracts string literal keys accepted by Pick and Omit heritage expressions.
fn property_keys(parsed: ParsedType) -> Result<Vec<String>> {
    match parsed {
        ParsedType::Reference(reference) => property_keys(*reference.parsed),
        ParsedType::Union(types) => types.into_iter().try_fold(Vec::new(), |mut keys, item| {
            keys.extend(property_keys(item)?);
            Ok(keys)
        }),
        ParsedType::Standard(StandardType { name }) if name == "never" => Ok(Vec::new()),
        ParsedType::Standard(StandardType { name })
            if (name.starts_with('"') && name.ends_with('"'))
                || (name.starts_with('\'') && name.ends_with('\'')) =>
        {
            Ok(vec![name[1..name.len() - 1].to_string()])
        }
        other => {
            Err(format!("Expected string literal keys in Pick or Omit, found: {other:?}").into())
        }
    }
}
