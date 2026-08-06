use std::fs::read_to_string;

use oxc::ast::{AstKind, ast::IdentifierReference};
use oxc_semantic::Semantic;

use crate::defs::{PathResolver, ResolvedReference};
use crate::parser::parse_ts;
use crate::prelude::*;

pub fn resolve_reference<T: for<'a> FnMut(ResolvedReference<'a>) -> Result<()>>(
    ident: &IdentifierReference,
    semantic: &Semantic,
    resolver: &PathResolver,
    mut callback: T,
) -> Result<()> {
    let reference = semantic.scoping().get_reference(ident.reference_id());

    let Some(sym_id) = reference.symbol_id() else {
        return Ok(());
    };

    let sym = semantic.symbol_declaration(sym_id);

    let AstKind::ImportSpecifier(spec) = sym.kind() else {
        return Ok(());
    };

    let target = spec.imported.name().to_string();

    for ancestor in semantic.nodes().ancestors(spec.node_id()) {
        let AstKind::ImportDeclaration(decl) = ancestor.kind() else {
            continue;
        };

        let src = decl.source.to_string();
        resolver.resolve(&src, |file| {
            let content = read_to_string(&file)?;

            if !content.contains(&target) {
                return Ok(false);
            }

            let mut has_found = false;

            parse_ts(&content, |node, semantic, _program| {
                match node.kind() {
                    AstKind::VariableDeclarator(decl) => {
                        let name = decl.id.get_identifier_name().map(|name| name.to_string());

                        if name.as_ref() != Some(&target) {
                            return Ok(false);
                        }

                        callback(ResolvedReference::VariableDeclarator(decl, semantic))?;
                    }
                    AstKind::TSTypeAliasDeclaration(decl) => {
                        let name = decl.id.to_string();

                        if name != target {
                            return Ok(false);
                        }

                        callback(ResolvedReference::TSTypeAliasDeclaration(decl, semantic))?;
                    }
                    AstKind::TSInterfaceDeclaration(decl) => {
                        let name = decl.id.to_string();

                        if name != target {
                            return Ok(false);
                        }

                        callback(ResolvedReference::TSInterfaceDeclaration(decl, semantic))?;
                    }
                    _ => return Ok(false),
                }

                has_found = true;
                Ok(true)
            })?;

            Ok(has_found)
        })?;
    }

    Ok(())
}
