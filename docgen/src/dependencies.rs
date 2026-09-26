use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
    sync::LazyLock,
};

use oxc::{
    allocator::Allocator,
    ast::ast::{Declaration, ExportDefaultDeclarationKind, Expression, Statement},
    parser::Parser,
    span::SourceType,
};
use regex::Regex;

use crate::{Result, parser::source::extract_svelte_scripts, resolver::PathResolver};

#[derive(Default)]
pub struct SourceGraph {
    project_root: PathBuf,
    dependencies: BTreeMap<PathBuf, Vec<PathBuf>>,
}

impl SourceGraph {
    pub fn new(project_root: &Path) -> Self {
        Self {
            project_root: project_root.to_path_buf(),
            ..Self::default()
        }
    }

    pub fn collect_source_files(&mut self, roots: &[PathBuf]) -> Result<BTreeSet<PathBuf>> {
        let lib = self.project_root.join("src/lib");
        self.collect_source_files_with(roots, &mut |source, importer| {
            PathResolver(importer).resolve_local_file(source, Some(&lib))
        })
    }

    pub fn collect_source_files_with(
        &mut self,
        roots: &[PathBuf],
        resolve: &mut dyn FnMut(&str, &Path) -> Result<Option<PathBuf>>,
    ) -> Result<BTreeSet<PathBuf>> {
        let mut files = BTreeSet::new();
        let mut pending = roots.to_vec();

        while let Some(file) = pending.pop() {
            let file = file.canonicalize()?;

            if !is_source_file(&file) || !files.insert(file.clone()) {
                continue;
            }

            pending.extend(self.get_dependencies(&file, resolve)?.iter().cloned());
        }

        Ok(files)
    }

    fn get_dependencies(
        &mut self,
        file: &Path,
        resolve: &mut dyn FnMut(&str, &Path) -> Result<Option<PathBuf>>,
    ) -> Result<&[PathBuf]> {
        if !self.dependencies.contains_key(file) {
            let source = fs::read_to_string(file)?;
            let scripts = if file
                .extension()
                .is_some_and(|extension| extension == "svelte")
            {
                extract_svelte_scripts(&source)
                    .map(|(_, script)| script)
                    .collect()
            } else {
                vec![source.as_str()]
            };
            let mut dependencies = Vec::new();

            for script in scripts {
                for import in scan_imports(script) {
                    if (import.starts_with('.')
                        || import.starts_with('$')
                        || Path::new(&import).is_absolute())
                        && let Some(dependency) = resolve(&import, file)?
                        && is_source_file(&dependency)
                    {
                        dependencies.push(dependency.canonicalize()?);
                    }
                }
            }

            if matches!(
                file.extension().and_then(|extension| extension.to_str()),
                Some("ts" | "mts" | "cts")
            ) {
                for name in scan_interfaces(&source) {
                    let component = file.with_file_name(format!("{name}.svelte"));

                    if component.is_file() {
                        dependencies.push(component.canonicalize()?);
                    }
                }
            }

            self.dependencies.insert(file.to_path_buf(), dependencies);
        }

        Ok(&self.dependencies[file])
    }
}

fn is_source_file(file: &Path) -> bool {
    !matches!(
        file.file_name().and_then(|name| name.to_str()),
        Some("docs.ts" | "docs.props.ts" | "docs.snippets.ts")
    ) && matches!(
        file.extension().and_then(|extension| extension.to_str()),
        Some("ts" | "mts" | "cts" | "js" | "mjs" | "cjs" | "svelte")
    )
}

// Dependency discovery must keep working while a user's edit is not valid TypeScript.
fn scan_imports(source: &str) -> Vec<String> {
    let tokens = tokenize(source);
    let mut imports = Vec::new();
    let mut declaration = "";

    for (index, token) in tokens.iter().copied().enumerate() {
        let previous = index
            .checked_sub(1)
            .map(|index| tokens[index])
            .unwrap_or("");
        let before_previous = index
            .checked_sub(2)
            .map(|index| tokens[index])
            .unwrap_or("");
        let is_module_string = previous == "import"
            || (previous == "from" && !declaration.is_empty())
            || (previous == "("
                && (before_previous == "import"
                    || (before_previous == "require" && declaration == "import")));

        if is_module_string && let Some(value) = parse_string(token) {
            imports.push(value);
            declaration = "";
        }

        match token {
            "import" | "export" => declaration = token,
            ";" => declaration = "",
            _ => {}
        }
    }

    imports
}

fn scan_interfaces(source: &str) -> Vec<String> {
    if !source.contains("interface") {
        return Vec::new();
    }

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, SourceType::ts()).parse();

    if !parsed.panicked {
        return parsed
            .program
            .body
            .iter()
            .filter_map(|statement| {
                let interface = match statement {
                    Statement::TSInterfaceDeclaration(interface) => interface,
                    Statement::ExportDeclaration(export) => match &export.declaration {
                        Declaration::TSInterfaceDeclaration(interface) => interface,
                        _ => return None,
                    },
                    Statement::ExportDefaultDeclaration(export) => match &export.declaration {
                        ExportDefaultDeclarationKind::TSInterfaceDeclaration(interface) => {
                            interface
                        }
                        _ => return None,
                    },
                    _ => return None,
                };
                interface
                    .id
                    .name
                    .strip_suffix("Props")
                    .filter(|name| !name.is_empty())
                    .map(str::to_owned)
            })
            .collect();
    }

    let tokens = tokenize(source);
    let mut interfaces = Vec::new();
    let mut depth: usize = 0;

    for pair in tokens.windows(2) {
        match pair[0] {
            "interface" if depth == 0 => {
                if let Some(name) = pair[1]
                    .strip_suffix("Props")
                    .filter(|name| !name.is_empty())
                {
                    interfaces.push(name.to_owned());
                }
            }
            "{" => depth += 1,
            "}" => depth = depth.saturating_sub(1),
            _ => {}
        }
    }

    interfaces
}

fn parse_string(token: &str) -> Option<String> {
    if !token.starts_with(['\'', '"', '`']) {
        return None;
    }

    let quote = token.chars().next()?;

    let allocator = Allocator::default();
    // The TypeScript preprocessor also reports imports whose closing quote is still being typed.
    let closing = if token.len() > 1 && token.ends_with(quote) {
        String::new()
    } else {
        quote.to_string()
    };
    let source = format!("({token}{closing})");
    let parsed = Parser::new(&allocator, &source, SourceType::ts()).parse();
    let Statement::ExpressionStatement(statement) = parsed.program.body.first()? else {
        return None;
    };

    match statement.expression.get_inner_expression() {
        Expression::StringLiteral(literal) => Some(literal.value.to_string()),
        Expression::TemplateLiteral(literal) if literal.expressions.is_empty() => literal
            .quasis
            .first()?
            .value
            .cooked
            .map(|value| value.to_string()),
        _ => None,
    }
}

fn tokenize(source: &str) -> Vec<&str> {
    static TOKENS: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(
        r#"(?s)//[^\r\n]*|/\*.*?(?:\*/|$)|"(?:\\.|[^"\\\r\n])*"?|'(?:\\.|[^'\\\r\n])*'?|[\p{L}_$][\p{L}\p{N}_$]*|[^\s]"#
    ).unwrap()
    });
    let mut tokens = Vec::new();
    let mut cursor = 0;
    let mut depth: usize = 0;
    let mut templates = Vec::new();

    while let Some(found) = TOKENS.find_at(source, cursor) {
        let token = found.as_str();
        cursor = found.end();

        if token.starts_with("//") || token.starts_with("/*") {
            continue;
        }

        if token == "`" {
            let (end, has_expression) = scan_template(source, cursor);
            cursor = end;

            if !has_expression {
                tokens.push(&source[found.start()..end]);
                continue;
            }

            templates.push(depth);
            depth += 1;
            tokens.push("{");
            continue;
        }

        tokens.push(token);

        match token {
            "{" => depth += 1,
            "}" => {
                depth = depth.saturating_sub(1);

                if templates.last() == Some(&depth) {
                    let (end, has_expression) = scan_template(source, cursor);
                    cursor = end;

                    if has_expression {
                        depth += 1;
                        tokens.push("{");
                    } else {
                        templates.pop();
                    }
                }
            }
            _ => {}
        }
    }

    tokens
}

fn scan_template(source: &str, start: usize) -> (usize, bool) {
    static BOUNDARIES: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(?s)\\.|`|\$\{").unwrap());

    for boundary in BOUNDARIES.find_iter(&source[start..]) {
        if boundary.as_str() == "`" || boundary.as_str() == "${" {
            return (start + boundary.end(), boundary.as_str() == "${");
        }
    }

    (source.len(), false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::Fixture;

    #[test]
    fn scans_dependencies_through_invalid_code_without_reading_comments_or_strings() {
        let source = r#"
            // import './comment'; interface CommentProps {}
            const text = "import './string'; interface StringProps {}";
            import type { A } from './a'; const = ; export type { B } from './b';
            import C = require('./c'); const d = import(`./d`);
            type E = import('./e').E; require('./not-a-module-import');
            const template = `import './text' ${import('./f')} tail ${`nested ${import('./g')}`}`;
            import '\u002e/escaped'; export interface ExampleProps {}
            namespace Nested { export interface HiddenProps {} }
            interface LocalProps {}; interface Props {}
        "#;
        assert_eq!(
            scan_imports(source),
            ["./a", "./b", "./c", "./d", "./e", "./f", "./g", "./escaped"]
        );
        assert_eq!(scan_interfaces(source), ["Example", "Local"]);
        assert_eq!(
            scan_imports("import './unfinished\nimport './next';"),
            ["./unfinished", "./next"]
        );
        assert_eq!(scan_imports("import(`./unfinished"), ["./unfinished"]);
    }

    #[test]
    fn recognizes_only_top_level_interfaces_despite_regular_expression_tokens() {
        assert_eq!(
            scan_interfaces(
                r#"
            const pattern = /{/;
            const words = /interface FakeProps/;
            export interface ExampleProps {}
            export default interface DefaultProps {}
            namespace Private { export interface HiddenProps {} }
        "#
            ),
            ["Example", "Default"]
        );
    }

    #[test]
    fn follows_both_extract_svelte_scripts_barrels_cycles_and_inherited_component_sources()
    -> Result<()> {
        let fixture = Fixture::new();
        let base_props = fixture.write(
            "src/lib/internal/base/props.ts",
            "export interface BaseProps {} export interface CommonProps {}",
        );
        let base = fixture.write(
            "src/lib/internal/base/Base.svelte",
            r#"
            <!-- <script>import './ignored';</script> -->
            <script module lang="ts">import './module';</script>
            <script generics="T extends Record<string, unknown>" lang="ts">
                import type { BaseProps } from './props'; const = ; import './instance';
            </script><style>@import './ignored';</style><button
        "#,
        );
        let module = fixture.write(
            "src/lib/internal/base/module.ts",
            "export * from './instance';",
        );
        let instance = fixture.write(
            "src/lib/internal/base/instance.ts",
            "export * from './module';",
        );
        let barrel = fixture.write(
            "src/lib/internal/base/index.ts",
            "export type { BaseProps } from './props';",
        );
        fixture.write("src/lib/internal/base/QCommon.svelte", "<p>Unrelated</p>");
        let props = fixture.write("src/lib/components/child/props.ts", "import type { BaseProps } from '$internal/base'; export interface ChildProps extends BaseProps {}");
        let child = fixture.write("src/lib/components/child/Child.svelte", "<p>Child</p>");
        let files =
            SourceGraph::new(&fixture.0).collect_source_files(std::slice::from_ref(&props))?;
        assert_eq!(
            files,
            BTreeSet::from([props, child, base_props, base, barrel, module, instance])
        );
        Ok(())
    }

    #[test]
    fn resolves_local_aliases_absolute_paths_and_typescript_suffixes_without_generated_docs()
    -> Result<()> {
        let fixture = Fixture::new();
        let absolute = fixture.write("outside.ts", "export type Outside = number;");
        let state = fixture.write("src/lib/state.svelte.ts", "export const state = 1;");
        let value = fixture.write("src/lib/value.ts", "export type Value = number;");
        let index = fixture.write("src/lib/utils/index.ts", "export type Utility = string;");

        for file in [
            "docs.ts",
            "docs.props.ts",
            "docs.snippets.ts",
            "ignored.css",
        ] {
            fixture.write(&format!("src/lib/{file}"), "This must not be parsed.");
        }

        let props = fixture.write(
            "src/lib/props.ts",
            &format!(
                r#"
            import '$lib/state.svelte'; import './value.js'; import '$utils'; import '{}';
            import './docs.ts'; import './docs.props.ts'; import './docs.snippets.ts';
            import './ignored.css'; import 'external-package'; import './missing';
        "#,
                absolute.display()
            ),
        );
        assert_eq!(
            SourceGraph::new(&fixture.0).collect_source_files(std::slice::from_ref(&props))?,
            BTreeSet::from([props, absolute, state, value, index])
        );
        Ok(())
    }

    #[test]
    fn uses_host_resolution_and_caches_shared_dependencies_for_one_run() -> Result<()> {
        let fixture = Fixture::new();
        let first = fixture.write(
            "first.ts",
            "export * from '$custom'; import 'external-package';",
        );
        let second = fixture.write("second.ts", "export type { Value } from './first';");
        let shared = fixture.write("shared.ts", "export type Value = string;");
        let mut calls = 0;
        let mut resolve = |source: &str, _: &Path| {
            calls += 1;
            Ok(Some(match source {
                "$custom" => shared.clone(),
                "./first" => first.clone(),
                _ => panic!("unexpected dependency: {source}"),
            }))
        };
        let mut graph = SourceGraph::new(&fixture.0);
        let expected = BTreeSet::from([first.clone(), second.clone(), shared.clone()]);
        assert_eq!(
            graph.collect_source_files_with(&[first.clone(), second.clone()], &mut resolve)?,
            expected
        );
        assert_eq!(
            graph.collect_source_files_with(&[second], &mut resolve)?,
            expected
        );

        #[cfg(unix)]
        {
            let link = fixture.0.join("linked.ts");
            std::os::unix::fs::symlink(&first, &link)?;
            assert_eq!(
                graph.collect_source_files_with(&[link], &mut resolve)?,
                BTreeSet::from([first.clone(), shared.clone()])
            );
        }

        assert_eq!(calls, 2);
        Ok(())
    }
}
