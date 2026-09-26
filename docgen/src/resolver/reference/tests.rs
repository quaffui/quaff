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
