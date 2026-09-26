use std::{
    collections::BTreeSet,
    fmt::{Debug, Formatter, Result as FmtResult},
    path::PathBuf,
};

use oxc::ast::ast::{ImportSpecifier, ModuleExportName};
use oxc::ast::{AstKind, ast::IdentifierReference};
use oxc_semantic::{AstNode, Semantic};

use crate::Result;
use crate::parser::source::{ParseSource, SourceType};
use crate::{
    constants::BUILTIN_TYPE_NAMES,
    resolver::{PathResolver, ReferenceNodeMatcher, ReferenceResolver, ResolvedReference},
};

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

/// Follows the module's exports rather than searching private sibling files for a matching name.
fn resolve_export(
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

#[cfg(test)]
mod tests {
    use crate::{parser::TSPropsParser, resolver::PathResolver, test_support::Fixture};

    #[test]
    fn imports_resolve_module_exports_without_namespace_members() -> crate::Result<()> {
        let fixture = Fixture::new();
        fixture.write(
            "types.ts",
            r#"
                namespace Internal {
                    export type Value = "wrong";
                    export interface Shape { wrong: string }
                    export const defaultValue = "wrong";
                }
                export type Value = "correct";
                export interface Shape { correct: string }
                export const defaultValue = "correct";
            "#,
        );
        let props = fixture.write(
            "props.ts",
            r#"
                import { Value, Shape, defaultValue } from "./types";
                export interface TestProps { value: Value; shape: Shape; default: typeof defaultValue }
            "#,
        );
        let parsed = props.parse_props(&PathResolver(&props))?;
        let definitions = &parsed["TestProps"].type_definitions;
        assert_eq!(definitions["Value"], "type Value = \"correct\";");
        assert_eq!(
            definitions["Shape"],
            "interface Shape {\n  correct: string;\n}"
        );
        assert_eq!(
            definitions["defaultValue"],
            "const defaultValue = \"correct\";"
        );
        Ok(())
    }

    #[test]
    fn resolves_named_reexports_without_reading_unexported_siblings() -> crate::Result<()> {
        let fixture = Fixture::new();
        fixture.write(
            "types/index.ts",
            "export type { Original as Public } from './actual';",
        );
        fixture.write("types/actual.ts", "export type Original = 'correct';");
        fixture.write("types/private.ts", "export type Public = 'wrong';");
        let props = fixture.write(
            "props.ts",
            "import type { Public } from './types'; export interface TestProps { value: Public }",
        );
        let parsed = props.parse_props(&PathResolver(&props))?;
        assert_eq!(
            parsed["TestProps"].type_definitions["Public"],
            "type Public = 'correct';"
        );
        Ok(())
    }

    #[test]
    fn resolves_nested_export_stars_and_ignores_cycles() -> crate::Result<()> {
        let fixture = Fixture::new();
        fixture.write(
            "types/index.ts",
            "export * from './cycle'; export * from './nested';",
        );
        fixture.write("types/cycle.ts", "export * from './index';");
        fixture.write("types/nested/index.ts", "export { Value } from '../value';");
        fixture.write(
            "types/value.ts",
            "type Internal = number; export { Internal as Value };",
        );
        let props = fixture.write(
            "props.ts",
            "import type { Value } from './types'; export interface TestProps { value: Value }",
        );
        let parsed = props.parse_props(&PathResolver(&props))?;
        assert_eq!(
            parsed["TestProps"].type_definitions["Value"],
            "type Value = number;"
        );
        Ok(())
    }

    #[test]
    fn resolves_svelte_typescript_suffixes_and_lib_alias() -> crate::Result<()> {
        let fixture = Fixture::new();
        fixture.write("lib/state.svelte.ts", "export type Value = number;");
        let props = fixture.write("lib/components/props.ts", "import type { Value } from '$lib/state.svelte'; export interface TestProps { value: Value }");
        let parsed = props.parse_props(&PathResolver(&props))?;
        assert_eq!(
            parsed["TestProps"].type_definitions["Value"],
            "type Value = number;"
        );
        Ok(())
    }
}
