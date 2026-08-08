use std::collections::HashMap;

use oxc::ast::ast::{Expression, TSInterfaceHeritage, TSTypeParameterInstantiation};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        ExternalType, ParsedHeritage, ParsedProp, ParsedPropertyFlags, ParsedProps, ParsedType,
        PathResolver, ResolvedReference, TypeDependencies,
    },
    parser::{interfaces::parse_interface, parse_type},
    prelude::{Result, SpanDisplay},
    resolver::resolve_reference,
};

pub fn parse_heritage(
    heritage: &oxc::allocator::Vec<TSInterfaceHeritage>,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<ParsedHeritage> {
    let mut dom: Option<ParsedType> = None;
    let mut herited_props: ParsedProps = HashMap::new();

    for clause in heritage {
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

        resolve_reference(ident, semantic, resolver, |resolved| {
            let ResolvedReference::TSInterfaceDeclaration(decl, sem) = resolved else {
                return Err(format!(
                    "The interface is extending a non-interface declaration. Parsing: {:#?} / Found: {:#?}",
                    clause,
                    resolved
                )
                .into());
            };

            let parsed = parse_interface(decl, type_deps, sem, resolver, &type_args)?;

            for prop in parsed.properties {
                let mut flags = ParsedPropertyFlags::None;
                if prop.optional {
                    flags |= ParsedPropertyFlags::Optional;
                }

                let mut description = "No description provided.".to_string();
                let mut default: Option<String> = None;

                if let Some(comment) = prop.comment {
                    description = comment.description.to_string();
                    default = comment.default;
                }

                let prop_def = ParsedProp {
                    name: prop.name.clone(),
                    description,
                    flags,
                    type_def: prop.type_annotation,
                    default,
                };

                herited_props.insert(prop.name, prop_def);
            }

            Ok(())
        })?;
    }

    Ok(ParsedHeritage { dom, herited_props })
}

fn parse_heritage_type_argument(
    arg: &TSTypeParameterInstantiation,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<Vec<ParsedType>> {
    let mut parsed = Vec::new();

    for arg in &arg.params {
        parsed.push(parse_type(
            arg,
            type_deps,
            semantic,
            resolver,
            &[],
            &vec![],
        )?)
    }

    Ok(parsed)
}
