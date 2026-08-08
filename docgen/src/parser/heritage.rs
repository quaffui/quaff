use std::collections::HashMap;

use oxc::ast::ast::{Expression, TSInterfaceHeritage, TSTypeParameterInstantiation};
use oxc_semantic::Semantic;

use crate::{
    defs::{
        ExternalType, ParsedHeritage, ParsedProps, ParsedType, PathResolver, ResolvedReference,
        TypeDependencies,
    },
    parser::interfaces::parse_interface,
    prelude::{Result, SpanDisplay},
    resolver::resolve_reference,
};

pub fn parse_heritage<T>(
    heritage: Vec<&TSInterfaceHeritage>,
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

        let type_arg = clause
            .type_arguments
            .as_ref()
            .map(|arg| parse_heritage_type_argument(arg, type_deps, semantic, resolver))
            .transpose()?;

        resolve_reference(ident, semantic, resolver, |resolved| {
            let ResolvedReference::TSInterfaceDeclaration(decl, sem) = resolved else {
                return Err(format!(
                    "The interface is extending a non-interface declaration. Parsing: {:#?} / Found: {:#?}",
                    clause,
                    resolved
                )
                .into());
            };

            let parsed = parse_interface(decl, type_deps, sem, resolver, &type_arg)?;

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
) -> Result<ParsedType> {
    todo!()
}
