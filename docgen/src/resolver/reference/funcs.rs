use std::{collections::BTreeSet, path::PathBuf};

use oxc::ast::{AstKind, ast::ModuleExportName};

use crate::{
    Result,
    parser::{ParseSource, SourceType},
    resolver::{PathResolver, ReferenceNodeMatcher, ResolvedReference},
};

/// Follows the module's exports rather than searching private sibling files for a matching name.
pub(super) fn resolve_export(
    source: &str,
    target: &str,
    resolver: &PathResolver,
    visited: &mut BTreeSet<(PathBuf, String)>,
    callback: &mut dyn for<'a> FnMut(ResolvedReference<'a>, &PathResolver<'a>) -> Result<()>,
) -> Result<bool> {
    if !source.starts_with('.') && !source.starts_with('$') {
        return Ok(false);
    }

    let file = resolver.resolve(source)?;
    let mut has_matching_export = false;

    if !visited.insert((file.clone(), target.to_string())) {
        return Ok(false);
    }

    let resolver = PathResolver(&file);
    let mut star_exports = Vec::new();

    SourceType::TS(&file).parse_source(|node, semantic| {
        let is_module_export = |id| matches!(semantic.nodes().parent_kind(id), AstKind::Program(_));

        match node.kind() {
            AstKind::ExportFromDeclaration(export) if is_module_export(node.id()) => {
                if let Some(specifier) = export
                    .specifiers
                    .iter()
                    .find(|specifier| specifier.exported.name() == target)
                {
                    has_matching_export = resolve_export(
                        &export.source.value,
                        specifier.local.name().as_str(),
                        &resolver,
                        visited,
                        callback,
                    )?;
                }
            }
            AstKind::ExportNamedDeclaration(export) if is_module_export(node.id()) => {
                if let Some(specifier) = export
                    .specifiers
                    .iter()
                    .find(|specifier| specifier.exported.name() == target)
                    && let ModuleExportName::IdentifierReference(identifier) = &specifier.local
                {
                    let reference = semantic.scoping().get_reference(identifier.reference_id());

                    if let Some(symbol) = reference.symbol_id() {
                        let declaration = semantic.symbol_declaration(symbol);

                        if let AstKind::ImportSpecifier(specifier) = declaration.kind() {
                            for ancestor in semantic.nodes().ancestors(declaration.id()) {
                                if let AstKind::ImportDeclaration(import) = ancestor.kind() {
                                    has_matching_export = resolve_export(
                                        &import.source.value,
                                        specifier.imported.name().as_str(),
                                        &resolver,
                                        visited,
                                        callback,
                                    )?;
                                    break;
                                }
                            }
                        } else {
                            has_matching_export = declaration.resolve_matching_node(
                                identifier.name.as_str(),
                                semantic,
                                &resolver,
                                &mut |resolved, resolver| callback(resolved, resolver),
                            )?;
                        }
                    }
                }
            }
            AstKind::ExportAllDeclaration(export)
                if export.exported.is_none() && is_module_export(node.id()) =>
            {
                star_exports.push(export.source.value.to_string());
            }
            _ => {
                let is_exported = match semantic.nodes().parent_kind(node.id()) {
                    AstKind::ExportDeclaration(export) => is_module_export(export.node_id.get()),
                    AstKind::VariableDeclaration(declaration) => {
                        match semantic.nodes().parent_kind(declaration.node_id()) {
                            AstKind::ExportDeclaration(export) => {
                                is_module_export(export.node_id.get())
                            }
                            _ => false,
                        }
                    }
                    _ => false,
                };

                if is_exported {
                    has_matching_export = node.resolve_matching_node(
                        target,
                        semantic,
                        &resolver,
                        &mut |resolved, resolver| callback(resolved, resolver),
                    )?;
                }
            }
        }

        Ok(has_matching_export)
    })?;

    // Explicit exports take precedence over export-star declarations regardless of source order.
    if has_matching_export {
        return Ok(true);
    }

    for source in star_exports {
        if resolve_export(&source, target, &resolver, visited, callback)? {
            return Ok(true);
        }
    }

    Ok(false)
}
