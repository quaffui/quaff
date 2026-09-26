use oxc::allocator::Vec as OxcVec;
use oxc::ast::ast::{TSInterfaceHeritage, TSTypeName};
use oxc_semantic::Semantic;

use crate::{
    Result, SpanDisplay,
    extractor::{Extractor, GenericBindings, GenericBindingsParser},
    parser::{ExternalType, InterfaceParser, ParsedType, TypeParser, UtilityKVKind},
    resolver::{
        DefinitionKind, PathResolver, ReferenceResolver, ResolvedReference, TypeDefinition,
        TypeRegistry,
    },
};

use super::{HeritageInfo, HeritageParser, funcs::inherited_properties};

impl HeritageParser for OxcVec<'_, TSInterfaceHeritage<'_>> {
    fn parse_heritage(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<HeritageInfo> {
        let mut dom: Option<ParsedType> = None;
        let mut herited_props = Vec::new();

        for clause in self {
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
                    return Err(
                        format!("{} heritage requires two type arguments", ident.name).into(),
                    );
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
}
