use oxc::allocator::Vec as OxcVec;
use oxc::ast::ast::{TSInterfaceHeritage, TSTypeName};
use oxc_semantic::Semantic;

use crate::parser::types::interfaces::{
    InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey,
};
use crate::parser::types::ts_utilities::UtilityKVKind;
use crate::{
    Result, SpanDisplay,
    extractor::{
        Extractor,
        generics::{GenericBindings, GenericBindingsParser},
    },
    parser::types::{
        ExternalType, ParsedType, StandardType, TypeParser, interfaces::InterfaceParser,
    },
    resolver::{
        PathResolver, ReferenceResolver, ResolvedReference,
        dependency::{DefinitionKind, TypeDefinition, TypeRegistry},
    },
};

use super::HeritageInfo;

pub(super) fn parse_heritage(
    heritage: &OxcVec<'_, TSInterfaceHeritage<'_>>,
    semantic: &Semantic,
    resolver: &PathResolver,
    generic_bindings: &GenericBindings,
    registry: &mut TypeRegistry,
) -> Result<HeritageInfo> {
    let mut dom: Option<ParsedType> = None;
    let mut herited_props = Vec::new();

    for clause in heritage {
        let whole_clause = clause.span.display(semantic);
        if let Some(mut external) = ExternalType::maybe_new(whole_clause.clone()) {
            external.name = whole_clause;
            dom = Some(ParsedType::External(external));

            continue;
        }

        let TSTypeName::IdentifierReference(ident) = &clause.type_name else {
            return Err(format!(
                "Unsupported interface heritage clause, expected an identifier. Parsing: {:#?}",
                clause
            )
            .into());
        };

        let type_args = clause
            .type_arguments
            .as_ref()
            .map(|args| {
                args.params
                    .iter()
                    .map(|arg| arg.parse_type(semantic, resolver, generic_bindings, registry))
                    .collect::<Result<Vec<ParsedType>>>()
            })
            .transpose()?
            .unwrap_or_default();

        let utility = match ident.name.as_str() {
            "Pick" => Some(UtilityKVKind::Pick),
            "Omit" => Some(UtilityKVKind::Omit),
            _ => None,
        };

        if let Some(kind) = utility {
            let [k, v] = type_args.as_slice() else {
                return Err(format!("{} heritage requires two type arguments", ident.name).into());
            };
            let (properties, dom_heritage) = inherited_properties(ParsedType::UtilityKV {
                kind,
                k: Box::new(k.clone()),
                v: Box::new(v.clone()),
            })?;

            if let Some(dom_heritage) = dom_heritage {
                dom = Some(*dom_heritage);
            }

            registry.record_properties_dependencies_for_current_owner(&properties);
            herited_props.extend(properties);
            continue;
        }

        ident.resolve(semantic, resolver, &mut |resolved, scope_resolver| {
                match resolved {
                    ResolvedReference::TSInterfaceDeclaration(decl, sem) => {
                        if decl.type_parameters.is_none() && !type_args.is_empty() {
                            return Err(format!(
                                "Interface {} does not accept type arguments",
                                decl.id.name
                            )
                            .into());
                        }

                        let definition_id = registry.definition_id(
                            scope_resolver.0,
                            decl.span.start,
                            DefinitionKind::Interface,
                        );
                        let is_resolving = registry.is_resolving(&definition_id);
                        registry.ensure_definition(definition_id, |registry| -> Result<TypeDefinition> {
                            let declaration_bindings = decl
                                .type_parameters
                                .as_ref()
                                .map(|params| params.declaration_bindings())
                                .unwrap_or_default();
                            let interface = decl.parse(
                                sem,
                                scope_resolver,
                                &declaration_bindings,
                                registry,
                            )?;

                            Ok(TypeDefinition::Interface(interface))
                        })?;

                        if is_resolving {
                            return Ok(());
                        }

                        let callee_bindings = decl
                            .type_parameters
                            .as_ref()
                            .map(|params| {
                                params.instantiate_bindings(
                                    &type_args,
                                    sem,
                                    scope_resolver,
                                    registry,
                                )
                            })
                            .transpose()?
                            .unwrap_or_default();
                        let parsed =
                            decl.parse(sem, scope_resolver, &callee_bindings, registry)?;

                        if let Some(dom_heritage) = &parsed.dom_props_heritage {
                            dom = Some((**dom_heritage).clone());
                        }

                        registry.record_interface_dependencies_for_current_owner(&parsed);
                        herited_props.extend(parsed.properties);
                    }
                    ResolvedReference::TSTypeAliasDeclaration(decl, sem) => {
                        if decl.type_parameters.is_none() && !type_args.is_empty() {
                            return Err(format!(
                                "Type alias {} does not accept type arguments",
                                decl.id.name
                            )
                            .into());
                        }

                        let definition_id = registry.definition_id(
                            scope_resolver.0,
                            decl.span.start,
                            DefinitionKind::TypeAlias,
                        );
                        let is_resolving = registry.is_resolving(&definition_id);
                        registry.ensure_definition(definition_id, |registry| -> Result<TypeDefinition> {
                            let generics = decl
                                .type_parameters
                                .as_ref()
                                .map(|params| params.extract(sem, scope_resolver, registry))
                                .transpose()?
                                .unwrap_or_default();
                            let declaration_bindings = decl
                                .type_parameters
                                .as_ref()
                                .map(|params| params.declaration_bindings())
                                .unwrap_or_default();
                            let value = decl.type_annotation.parse_type(
                                sem,
                                scope_resolver,
                                &declaration_bindings,
                                registry,
                            )?;

                            Ok(TypeDefinition::TypeAlias {
                                name: decl.id.name.to_string(),
                                generics,
                                value,
                            })
                        })?;

                        if is_resolving {
                            return Ok(());
                        }

                        let callee_bindings = decl
                            .type_parameters
                            .as_ref()
                            .map(|params| {
                                params.instantiate_bindings(
                                    &type_args,
                                    sem,
                                    scope_resolver,
                                    registry,
                                )
                            })
                            .transpose()?
                            .unwrap_or_default();
                        let parsed = decl.type_annotation.parse_type(
                            sem,
                            scope_resolver,
                            &callee_bindings,
                            registry,
                        )?;
                        let (properties, dom_heritage) = inherited_properties(parsed)?;

                        if let Some(dom_heritage) = dom_heritage {
                            dom = Some(*dom_heritage);
                        }

                        registry.record_properties_dependencies_for_current_owner(&properties);
                        herited_props.extend(properties);
                    },
                    _ => {
                        return Err(format!(
                            "The interface is extending a non-interface declaration. Parsing: {} / Found: {:?}",
                            clause.span.display(semantic),
                            resolved
                        )
                        .into())
                    }
                }


            Ok(())
        })?;
    }

    Ok(HeritageInfo { dom, herited_props })
}

type InheritedProperties = (Vec<InterfaceProperty>, Option<Box<ParsedType>>);

fn inherited_properties(parsed: ParsedType) -> Result<InheritedProperties> {
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

                        if !property.flags.contains(InterfacePropertyFlags::Optional) {
                            existing.flags.remove(InterfacePropertyFlags::Optional);
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
