use std::{
    collections::BTreeSet,
    fmt::{Debug, Formatter, Result as FmtResult},
};

use oxc::ast::ast::ImportSpecifier;
use oxc::ast::{AstKind, ast::IdentifierReference};
use oxc_semantic::{AstNode, Semantic};

use crate::Result;
use crate::{
    consts::BUILTIN_TYPE_NAMES,
    resolver::{PathResolver, ReferenceNodeMatcher, ReferenceResolver, ResolvedReference},
};

use super::funcs::resolve_export;

impl<'a> Debug for ResolvedReference<'a> {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        match self {
            Self::TSInterfaceDeclaration(decl, _) => decl.fmt(f),
            Self::TSTypeAliasDeclaration(decl, _) => decl.fmt(f),
            Self::VariableDeclarator(decl, _) => decl.fmt(f),
        }
    }
}

impl ReferenceResolver for IdentifierReference<'_> {
    fn resolve<T: for<'a> FnMut(ResolvedReference<'a>, &PathResolver) -> Result<()>>(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        callback: &mut T,
    ) -> Result<()> {
        if BUILTIN_TYPE_NAMES.contains(&self.name.as_str()) {
            // We ignore builtin types like Element, Record, Array, etc.
            return Ok(());
        }

        let reference = semantic.scoping().get_reference(self.reference_id());

        let Some(sym_id) = reference.symbol_id() else {
            return Ok(());
        };

        let decl = semantic.symbol_declaration(sym_id);

        match decl.kind() {
            AstKind::ImportSpecifier(spec) => spec.resolve(semantic, resolver, callback),
            AstKind::VariableDeclarator(decl) => callback(
                ResolvedReference::VariableDeclarator(decl, semantic),
                resolver,
            ),
            AstKind::TSTypeAliasDeclaration(decl) => callback(
                ResolvedReference::TSTypeAliasDeclaration(decl, semantic),
                resolver,
            ),
            AstKind::TSInterfaceDeclaration(decl) => callback(
                ResolvedReference::TSInterfaceDeclaration(decl, semantic),
                resolver,
            ),
            _ => Ok(()),
        }
    }
}

impl ReferenceResolver for ImportSpecifier<'_> {
    fn resolve<T: for<'a> FnMut(ResolvedReference<'a>, &PathResolver<'a>) -> Result<()>>(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        callback: &mut T,
    ) -> Result<()> {
        for ancestor in semantic.nodes().ancestors(self.node_id()) {
            let AstKind::ImportDeclaration(decl) = ancestor.kind() else {
                continue;
            };

            resolve_export(
                &decl.source.value,
                self.imported.name().as_str(),
                resolver,
                &mut BTreeSet::new(),
                callback,
            )?;
            break;
        }

        Ok(())
    }
}

impl ReferenceNodeMatcher for AstNode<'_> {
    fn resolve_matching_node<
        T: for<'a> FnMut(ResolvedReference<'a>, &PathResolver<'a>) -> Result<()>,
    >(
        &self,
        match_target: &str,
        semantic: &Semantic,
        resolver: &PathResolver,
        callback: &mut T,
    ) -> Result<bool> {
        match self.kind() {
            AstKind::VariableDeclarator(decl) => {
                let name = decl.id.get_identifier_name().map(|name| name.to_string());

                if name != Some(match_target.to_string()) {
                    return Ok(false);
                }

                callback(
                    ResolvedReference::VariableDeclarator(decl, semantic),
                    resolver,
                )?;
            }
            AstKind::TSTypeAliasDeclaration(decl) => {
                let name = decl.id.to_string();

                if name != match_target {
                    return Ok(false);
                }

                callback(
                    ResolvedReference::TSTypeAliasDeclaration(decl, semantic),
                    resolver,
                )?;
            }
            AstKind::TSInterfaceDeclaration(decl) => {
                let name = decl.id.to_string();

                if name != match_target {
                    return Ok(false);
                }

                callback(
                    ResolvedReference::TSInterfaceDeclaration(decl, semantic),
                    resolver,
                )?;
            }
            _ => return Ok(false),
        }

        Ok(true)
    }
}
