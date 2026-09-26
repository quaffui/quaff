use std::{collections::BTreeSet, path::Path};

use super::{
    SourceGraph,
    funcs::{scan_imports, scan_interfaces},
};
use crate::Result;
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
fn follows_both_extract_svelte_scripts_barrels_cycles_and_inherited_component_sources() -> Result<()>
{
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
    let files = SourceGraph::new(&fixture.0).collect_source_files(std::slice::from_ref(&props))?;
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
