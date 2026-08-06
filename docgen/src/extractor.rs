use oxc::ast::ast::TSTypeParameterDeclaration;
use oxc_semantic::Semantic;

use crate::defs::{ParsedGeneric, PathResolver, TypeDependencies};
use crate::parser::parse_type;
use crate::prelude::Result;

pub fn extract_generics(
    decl: &TSTypeParameterDeclaration,
    type_deps: &mut TypeDependencies,
    semantic: &Semantic,
    resolver: &PathResolver,
) -> Result<Vec<ParsedGeneric>> {
    let mut generics: Vec<ParsedGeneric> = Vec::new();

    for param in &decl.params {
        let name = param.name.to_string();
        let constraint = param
            .constraint
            .as_ref()
            .map(|t| parse_type(t, type_deps, semantic, resolver, &[]))
            .transpose()?;
        let default = param
            .default
            .as_ref()
            .map(|t| parse_type(t, type_deps, semantic, resolver, &[]))
            .transpose()?;

        generics.push(ParsedGeneric {
            name,
            constraint,
            default,
        });
    }

    Ok(generics)
}
