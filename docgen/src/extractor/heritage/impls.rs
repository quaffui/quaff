use oxc::allocator::Vec as OxcVec;
use oxc::ast::ast::{
    Expression, TSInterfaceHeritage, TSTypeAliasDeclaration, TSTypeParameterInstantiation,
};
use oxc_semantic::Semantic;

use crate::parser::types::StandardType;
use crate::parser::types::interfaces::InterfaceProperty;
use crate::parser::types::ts_utilities::UtilityKVKind;
use crate::{
    Result, SpanDisplay,
    extractor::Extractor,
    parser::types::{
        ExternalType, ParsedType, TypeDependencies, TypeParser, interfaces::InterfaceParser,
    },
    resolver::{PathResolver, ReferenceResolver, ResolvedReference},
};

use super::HeritageInfo;

impl Extractor<HeritageInfo> for OxcVec<'_, TSInterfaceHeritage<'_>> {
    fn extract(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        type_deps: &mut TypeDependencies,
    ) -> Result<HeritageInfo> {
        let mut dom: Option<ParsedType> = None;
        let mut herited_props = Vec::new();

        for clause in self {
            let whole_clause = clause.span.display(semantic);
            if let Some(external) = ExternalType::maybe_new(whole_clause) {
                dom = Some(ParsedType::External(external));

                continue;
            }

            let Expression::Identifier(ident) = &clause.expression else {
                return Err(format!(
                    "Unsupported interface heritage clause, expected an identifier. Parsing: {:#?}",
                    clause
                )
                .into());
            };

            let type_args = clause
                .type_arguments
                .as_ref()
                .map(|arg| parse_heritage_type_argument(arg, type_deps, semantic, resolver))
                .transpose()?
                .unwrap_or_default();

            ident.resolve(semantic, resolver, &mut |resolved, scope_resolver| {
                match resolved {
                    ResolvedReference::TSInterfaceDeclaration(decl, sem) => {
                        let parsed = decl.parse(sem, resolver, &type_args, type_deps)?;
                        herited_props.extend(parsed.properties);
                    }
                    ResolvedReference::TSTypeAliasDeclaration(decl, sem) => {
                        let parsed = decl.type_annotation.parse_type(sem, scope_resolver, &[], &type_args, type_deps)?;
                        if let ParsedType::UtilityKV { kind, k, v } = parsed {
                            match kind {
                                UtilityKVKind::Pick => {
                                    let (all_props, props_to_pick, dom_heritage) = parse_utility_reference(k, v, decl, sem)?;
                                    let filtered: Vec<InterfaceProperty> = all_props.into_iter().filter(|p| props_to_pick.contains(&p.name)).collect();

                                    if let Some(dom_heritage) = dom_heritage {
                                        dom = Some(*dom_heritage);
                                    }

                                    herited_props.extend(filtered);
                                },
                                UtilityKVKind::Omit => {
                                    let (all_props, props_to_omit, dom_heritage) = parse_utility_reference(k, v, decl, sem)?;
                                    let filtered: Vec<InterfaceProperty> = all_props.into_iter().filter(|p| !props_to_omit.contains(&p.name)).collect();

                                    if let Some(dom_heritage) = dom_heritage {
                                        dom = Some(*dom_heritage);
                                    }

                                    herited_props.extend(filtered);
                                },
                                _ => {
                                    return Err(format!("Unsupported utility type used as heritage. Parsing: {:#?}", decl.span.display(sem)).into())
                                }
                            }
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
}

fn parse_heritage_type_argument(
    arg: &TSTypeParameterInstantiation,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<Vec<ParsedType>> {
    let mut parsed = Vec::new();

    for arg in &arg.params {
        parsed.push(arg.parse_type(semantic, resolver, &[], &[], type_deps)?)
    }

    Ok(parsed)
}

fn parse_utility_reference(
    k: Box<ParsedType>,
    v: Box<ParsedType>,
    decl: &TSTypeAliasDeclaration,
    semantic: &Semantic,
) -> Result<(Vec<InterfaceProperty>, Vec<String>, Option<Box<ParsedType>>)> {
    let ParsedType::Reference(reference) = *k else {
        return Err(format!(
            "Expected a type reference as the first argument of Pick. Parsing: {}",
            decl.span.display(semantic)
        )
        .into());
    };

    let ParsedType::Union(union) = *v else {
        return Err(format!(
            "Expected a type union as the second argument of Pick. Found: {:?}",
            *v
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
