use std::fs::read_to_string;

use oxc::ast::ast::ImportSpecifier;
use oxc::ast::{AstKind, ast::IdentifierReference};
use oxc_semantic::{AstNode, Semantic};

use crate::defs::{BUILTIN_TYPE_NAMES, EXTERNAL_PACKAGE_PREFIXES, PathResolver, ResolvedReference};
use crate::parser::parse_ts;
use crate::prelude::*;

pub fn resolve_reference<T: for<'a> FnMut(ResolvedReference<'a>) -> Result<()>>(
    ident: &IdentifierReference,
    semantic: &Semantic,
    resolver: &PathResolver,
    mut callback: T,
) -> Result<()> {
    if BUILTIN_TYPE_NAMES.contains(&ident.name.as_str()) {
        // We ignore builtin types like Element, Record, Array, etc.
        return Ok(());
    }

    let reference = semantic.scoping().get_reference(ident.reference_id());

    dbg!("{}", ident.name);

    let Some(sym_id) = reference.symbol_id() else {
        return Ok(());
    };

    let decl = semantic.symbol_declaration(sym_id);
    dbg!("{} -> {:#?}", ident.name, decl);

    match decl.kind() {
        AstKind::ImportSpecifier(spec) => {
            resolve_imported_identifier(spec, semantic, resolver, callback)
        }
        AstKind::VariableDeclarator(decl) => {
            callback(ResolvedReference::VariableDeclarator(decl, semantic))
        }
        AstKind::TSTypeAliasDeclaration(decl) => {
            callback(ResolvedReference::TSTypeAliasDeclaration(decl, semantic))
        }
        AstKind::TSInterfaceDeclaration(decl) => {
            callback(ResolvedReference::TSInterfaceDeclaration(decl, semantic))
        }
        _ => Ok(()),
    }
}

fn resolve_imported_identifier<T: for<'a> FnMut(ResolvedReference<'a>) -> Result<()>>(
    spec: &ImportSpecifier,
    semantic: &Semantic,
    resolver: &PathResolver,
    mut callback: T,
) -> Result<()> {
    let target = spec.imported.name().to_string();

    for ancestor in semantic.nodes().ancestors(spec.node_id()) {
        let AstKind::ImportDeclaration(decl) = ancestor.kind() else {
            continue;
        };

        let src = decl.source.to_string();

        if EXTERNAL_PACKAGE_PREFIXES
            .iter()
            .any(|prefix| src.starts_with(prefix))
        {
            // We ignore external package imports like svelte, shiki, etc.
            return Ok(());
        }

        resolver.resolve(&src, |file| {
            let content = read_to_string(&file)?;

            if !content.contains(&target) {
                return Ok(false);
            }

            let mut has_found = false;

            parse_ts(&content, |node, scope_sem, _program| {
                has_found |= resolve_matching_node(node, scope_sem, &mut callback, &target)?;
                Ok(has_found)
            })?;

            Ok(has_found)
        })?;
    }

    Ok(())
}

fn resolve_matching_node<T: for<'a> FnMut(ResolvedReference<'a>) -> Result<()>>(
    node: &AstNode,
    semantic: &Semantic,
    callback: &mut T,
    match_target: &str,
) -> Result<bool> {
    match node.kind() {
        AstKind::VariableDeclarator(decl) => {
            let name = decl.id.get_identifier_name().map(|name| name.to_string());

            if name != Some(match_target.to_string()) {
                return Ok(false);
            }

            callback(ResolvedReference::VariableDeclarator(decl, semantic))?;
        }
        AstKind::TSTypeAliasDeclaration(decl) => {
            let name = decl.id.to_string();

            if name != match_target {
                return Ok(false);
            }

            callback(ResolvedReference::TSTypeAliasDeclaration(decl, semantic))?;
        }
        AstKind::TSInterfaceDeclaration(decl) => {
            let name = decl.id.to_string();

            if name != match_target {
                return Ok(false);
            }

            callback(ResolvedReference::TSInterfaceDeclaration(decl, semantic))?;
        }
        _ => return Ok(false),
    }

    Ok(true)
}
