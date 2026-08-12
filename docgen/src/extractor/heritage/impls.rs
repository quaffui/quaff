use oxc::allocator::Vec as OxcVec;
use oxc::ast::ast::{TSInterfaceHeritage, TSTypeAliasDeclaration, TSTypeName};
use oxc_semantic::Semantic;

use crate::parser::types::interfaces::{InterfaceProperty, InterfacePropertyKey};
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
        if let Some(external) = ExternalType::maybe_new(whole_clause) {
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
                        let resolving = registry.is_resolving(&definition_id);
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

                        if resolving {
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
                        let resolving = registry.is_resolving(&definition_id);
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

                        if resolving {
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
                        if let ParsedType::UtilityKV { kind, k, v } = parsed {
                            match kind {
                                UtilityKVKind::Pick => {
                                    let (all_props, props_to_pick, dom_heritage) =
                                        parse_utility_reference(*k, *v, decl, sem)?;
                                    let filtered: Vec<InterfaceProperty> = all_props
                                        .into_iter()
                                        .filter(|p| {
                                            matches!(
                                                &p.key,
                                                InterfacePropertyKey::Identifier(name)
                                                    if props_to_pick.contains(name)
                                            )
                                        })
                                        .collect();

                                    if let Some(dom_heritage) = dom_heritage {
                                        dom = Some(*dom_heritage);
                                    }

                                    registry.record_properties_dependencies_for_current_owner(&filtered);
                                    herited_props.extend(filtered);
                                },
                                UtilityKVKind::Omit => {
                                    let (all_props, props_to_omit, dom_heritage) =
                                        parse_utility_reference(*k, *v, decl, sem)?;
                                    let filtered: Vec<InterfaceProperty> = all_props
                                        .into_iter()
                                        .filter(|p| {
                                            matches!(
                                                &p.key,
                                                InterfacePropertyKey::Identifier(name)
                                                    if !props_to_omit.contains(name)
                                            )
                                        })
                                        .collect();

                                    if let Some(dom_heritage) = dom_heritage {
                                        dom = Some(*dom_heritage);
                                    }

                                    registry.record_properties_dependencies_for_current_owner(&filtered);
                                    herited_props.extend(filtered);
                                },
                                _ => {
                                    return Err(format!("Unsupported utility type used as heritage. Parsing: {:#?}", decl.span.display(sem)).into())
                                }
                            }
                        } else if let ParsedType::Interface(interface) = &parsed {
                            if let Some(dom_heritage) = &interface.dom_props_heritage {
                                dom = Some(*dom_heritage.clone());
                            }

                            registry.record_interface_dependencies_for_current_owner(interface);
                            herited_props.extend(interface.properties.clone());
                        } else if let ParsedType::Reference(ref_type) = &parsed
                            && let ParsedType::Interface(interface) = ref_type.parsed.as_ref()
                        {
                            if let Some(dom_heritage) = &interface.dom_props_heritage {
                                dom = Some(*dom_heritage.clone());
                            }

                            registry.record_interface_dependencies_for_current_owner(interface);
                            herited_props.extend(interface.properties.clone());
                        }
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

type ParsedUtilityReference = (Vec<InterfaceProperty>, Vec<String>, Option<Box<ParsedType>>);

fn parse_utility_reference(
    k: ParsedType,
    v: ParsedType,
    decl: &TSTypeAliasDeclaration,
    semantic: &Semantic,
) -> Result<ParsedUtilityReference> {
    let ParsedType::Reference(reference) = k else {
        return Err(format!(
            "Expected a type reference as the first argument of Pick. Parsing: {}",
            decl.span.display(semantic)
        )
        .into());
    };

    let ParsedType::Union(union) = v else {
        return Err(format!(
            "Expected a type union as the second argument of Pick. Found: {:?}",
            v
        )
        .into());
    };

    let ParsedType::Interface(interface_ref) = *reference.parsed else {
        return Err(format!(
            "Expected the first argument of Pick to be a reference to an interface, found: {:?}",
            reference
        )
        .into());
    };

    let union_props = union
        .iter()
        .map(|prop| {
            let ParsedType::Standard(StandardType { name }) = prop else {
                panic!(
                    "Expected the second argument of Pick to be a union of strings, found: {:?}",
                    prop
                )
            };
            name.trim_matches('"').to_string()
        })
        .collect::<Vec<String>>();

    Ok((
        interface_ref.properties,
        union_props,
        interface_ref.dom_props_heritage,
    ))
}
