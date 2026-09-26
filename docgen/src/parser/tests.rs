use std::path::Path;

use crate::{parser::TSPropsParser, resolver::PathResolver, test_support::Fixture};

/// Parses a temporary props source through the complete interface parser.
fn parse_fixture(
    source: &str,
) -> crate::Result<std::collections::BTreeMap<String, crate::parser::ParsedPropsInterface>> {
    let fixture = Fixture::new();
    let path = fixture.write("props.ts", source);
    let resolver = PathResolver(Path::new(&path));

    path.parse_props(&resolver)
}

/// Parses an existing fixture with its own file resolver.
fn parse_path(
    path: &Path,
) -> crate::Result<std::collections::BTreeMap<String, crate::parser::ParsedPropsInterface>> {
    let resolver = PathResolver(path);
    path.parse_props(&resolver)
}

#[test]
fn emits_transitive_definitions_in_dependency_order() -> crate::Result<()> {
    let parsed = parse_fixture(
        r#"
            type QSize = "none" | "sm" | "md";
            type QBtnSizeOptions = Exclude<QSize, "none">;
            export interface QBtnProps { size?: QBtnSizeOptions }
        "#,
    )?;

    assert_eq!(
        parsed["QBtnProps"].type_definitions["QBtnSizeOptions"],
        "type QSize = \"none\" | \"sm\" | \"md\";\n\ntype QBtnSizeOptions = Exclude<QSize, \"none\">;"
    );

    Ok(())
}

#[test]
fn emits_generic_use_lookup_with_argument_dependencies() -> crate::Result<()> {
    let parsed = parse_fixture(
        r#"
            type QSize = "sm" | "md";
            type Box<T> = { value: T };
            export interface GenericProps { box: Box<QSize> }
        "#,
    )?;
    let docs = &parsed["GenericProps"];

    assert_eq!(
        docs.type_definitions["Box<QSize>"],
        "type QSize = \"sm\" | \"md\";\n\ntype Box<T> = {\n  value: T;\n};"
    );
    let crate::parser::ParsedType::Reference(reference) =
        &docs.interface.properties[0].type_annotation
    else {
        panic!("expected a generic reference")
    };
    assert_eq!(reference.name, "Box");
    assert_eq!(reference.type_args.len(), 1);
    let crate::parser::ParsedType::TypeLiteral(properties) = reference.parsed.as_ref() else {
        panic!("expected the instantiated Box body")
    };
    let crate::parser::ParsedType::Reference(instantiated_value) = &properties[0].type_annotation
    else {
        panic!("expected the instantiated QSize reference")
    };
    assert_eq!(instantiated_value.name, "QSize");
    assert!(matches!(
        instantiated_value.parsed.as_ref(),
        crate::parser::ParsedType::Union(values) if values.len() == 2
    ));

    Ok(())
}

#[test]
fn emits_mutually_recursive_definitions_once_and_target_last() -> crate::Result<()> {
    let parsed = parse_fixture(
        r#"
            type A = { b: B };
            type B = { a: A };
            export interface CycleProps { value: A }
        "#,
    )?;
    let definition = &parsed["CycleProps"].type_definitions["A"];

    assert_eq!(
        definition,
        "type B = {\n  a: A;\n};\n\ntype A = {\n  b: B;\n};"
    );
    assert_eq!(definition.matches("type A =").count(), 1);
    assert_eq!(definition.matches("type B =").count(), 1);

    Ok(())
}

#[test]
fn resolves_imported_transitive_definitions_from_a_stable_lib_root() -> crate::Result<()> {
    let fixture = Fixture::new();
    fixture.write(
        "lib/utils/index.ts",
        r#"
            export type QSize = "none" | "md";
            export type QBtnSizeOptions = Exclude<QSize, "none">;
        "#,
    );
    let props = fixture.write(
        "lib/components/button/props.ts",
        r#"
            import type { QBtnSizeOptions } from "$utils";
            export interface QBtnProps { size?: QBtnSizeOptions }
        "#,
    );

    let parsed = parse_path(&props)?;
    assert_eq!(
        parsed["QBtnProps"].type_definitions["QBtnSizeOptions"],
        "type QSize = \"none\" | \"md\";\n\ntype QBtnSizeOptions = Exclude<QSize, \"none\">;"
    );

    Ok(())
}

#[test]
fn extended_interface_is_omitted_from_type_definitions() -> crate::Result<()> {
    let parsed = parse_fixture(
        r#"
            type SizeValue = "sm" | "md";
            interface Sizeable {
                size?: SizeValue;
            }
            export interface ChildProps extends Sizeable {
                child?: string;
            }
            export interface ParentProps {
                prop?: ChildProps;
            }
        "#,
    )?;
    let child_def = &parsed["ParentProps"].type_definitions["ChildProps"];
    assert!(!child_def.contains("interface Sizeable"));
    assert!(child_def.contains("type SizeValue = \"sm\" | \"md\";"));
    assert!(child_def.contains("interface ChildProps {"));
    assert!(child_def.contains("size?: SizeValue;"));
    assert!(child_def.contains("child?: string;"));

    Ok(())
}

#[test]
fn renamed_module_types_do_not_emit_colliding_unused_declarations() -> crate::Result<()> {
    let fixture = Fixture::new();
    fixture.write("left.ts", "export type Value = string;");
    fixture.write("right.ts", "export type Value = number;");
    let props = fixture.write(
        "props.ts",
        r#"
        import type { Value as LeftValue } from "./left";
        import type { Value as RightValue } from "./right";
        type Pair = [LeftValue, RightValue];
        export interface Props { value: Pair }
    "#,
    );
    let parsed = parse_path(&props)?;
    assert_eq!(
        parsed["Props"].type_definitions["Pair"],
        "type LeftValue = string;\ntype RightValue = number;\n\ntype Pair = [LeftValue, RightValue];"
    );

    Ok(())
}

#[test]
fn renamed_recursive_types_keep_canonical_references_in_transitive_definitions() -> crate::Result<()>
{
    let fixture = Fixture::new();
    fixture.write("node.ts", "export type TreeNode = { next?: TreeNode };");
    fixture.write(
        "wrapper.ts",
        r#"
        import type { TreeNode as ChildNode } from "./node";
        export type Wrapper = { value: ChildNode };
    "#,
    );
    let props = fixture.write(
        "props.ts",
        r#"
        import type { Wrapper as LocalWrapper } from "./wrapper";
        export interface Props { value: LocalWrapper }
    "#,
    );
    let parsed = parse_path(&props)?;
    let definition = &parsed["Props"].type_definitions["LocalWrapper"];
    assert!(definition.contains("type TreeNode = {\n  next?: TreeNode;\n};"));
    assert!(definition.contains("type ChildNode = {\n  next?: TreeNode;\n};"));
    assert!(definition.contains("type LocalWrapper = {\n  value: ChildNode;\n};"));
    assert!(!definition.contains("type Wrapper ="));

    Ok(())
}

#[test]
fn renamed_typeof_dependencies_preserve_the_original_value_declaration() -> crate::Result<()> {
    let fixture = Fixture::new();
    fixture.write(
        "labels.ts",
        r#"export const defaultLabels = { open: "Open", close: "Close" };"#,
    );
    let props = fixture.write(
        "props.ts",
        r#"
        import { defaultLabels as labels } from "./labels";
        type Labels = typeof labels;
        export interface Props { labels: Labels }
    "#,
    );
    let parsed = parse_path(&props)?;
    assert_eq!(
        parsed["Props"].type_definitions["Labels"],
        r#"const labels = { open: "Open", close: "Close" };

type Labels = typeof labels;"#
    );

    Ok(())
}
