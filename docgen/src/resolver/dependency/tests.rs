use crate::{
    extractor::GenericInfo,
    parser::{ParsedType, StandardType},
};

use super::*;

fn id(name: &str) -> DefinitionId {
    DefinitionId::new(format!("types/{name}.ts"), 0, DefinitionKind::TypeAlias)
}

fn alias(name: &str, value: &str) -> TypeDefinition {
    TypeDefinition::TypeAlias {
        name: name.to_string(),
        generics: Vec::new(),
        value: ParsedType::Standard(StandardType::new(value.to_string())),
    }
}

#[test]
fn orders_transitive_dependencies_before_the_target() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let a = id("A");
    let b = id("B");
    let c = id("C");

    registry.ensure_definition(c.clone(), |_| Ok(alias("C", "string")))?;
    registry.ensure_definition(b.clone(), |registry| {
        registry.register_reference("C", "C", c.clone())?;
        Ok(alias("B", "C"))
    })?;
    registry.ensure_definition(a.clone(), |registry| {
        registry.register_reference("B", "B", b.clone())?;
        Ok(alias("A", "B"))
    })?;
    registry.register_reference("A", "A", a)?;

    assert_eq!(
        registry.build_type_definitions()?["A"],
        "type C = string;\ntype B = C;\n\ntype A = B;"
    );

    Ok(())
}

#[test]
fn deduplicates_diamond_dependencies() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let a = id("A");
    let b = id("B");
    let c = id("C");
    let d = id("D");

    registry.ensure_definition(d.clone(), |_| Ok(alias("D", "string")))?;

    for (current, name) in [(b.clone(), "B"), (c.clone(), "C")] {
        registry.ensure_definition(current, |registry| {
            registry.register_reference("D", "D", d.clone())?;
            Ok(alias(name, "D"))
        })?;
    }

    registry.ensure_definition(a.clone(), |registry| {
        registry.register_reference("B", "B", b)?;
        registry.register_reference("C", "C", c)?;
        Ok(alias("A", "B | C"))
    })?;
    registry.register_reference("A", "A", a)?;

    let definition = &registry.build_type_definitions()?["A"];
    assert_eq!(definition.matches("type D = string;").count(), 1);
    assert_eq!(
        definition,
        "type D = string;\ntype B = D;\ntype C = D;\n\ntype A = B | C;"
    );

    Ok(())
}

#[test]
fn terminates_self_references() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let node = id("Node");

    registry.ensure_definition(node.clone(), |registry| {
        registry.register_reference("Node", "Node", node.clone())?;
        let parsed_again = registry.ensure_definition(node.clone(), |_| {
            panic!("a resolving declaration must not be parsed again")
        })?;
        assert!(!parsed_again);

        Ok(alias("Node", "{ next?: Node }"))
    })?;

    assert_eq!(
        registry.build_type_definitions()?["Node"],
        "type Node = { next?: Node };"
    );

    Ok(())
}

#[test]
fn terminates_mutual_cycles_and_keeps_hovered_target_last() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let a = id("A");
    let b = id("B");

    registry.ensure_definition(a.clone(), |registry| {
        registry.register_reference("B", "B", b.clone())?;
        registry.ensure_definition(b.clone(), |registry| {
            registry.register_reference("A", "A", a.clone())?;
            assert!(!registry.ensure_definition(a.clone(), |_| {
                panic!("a resolving declaration must not be parsed again")
            })?);

            Ok(alias("B", "{ a: A }"))
        })?;

        Ok(alias("A", "{ b: B }"))
    })?;

    let definitions = registry.build_type_definitions()?;
    assert_eq!(definitions["A"], "type B = { a: A };\n\ntype A = { b: B };");
    assert_eq!(definitions["B"], "type A = { b: B };\n\ntype B = { a: A };");

    Ok(())
}

#[test]
fn renders_multiple_generic_uses_from_one_definition() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let boxed = id("Box");
    let size = id("QSize");

    registry.ensure_definition(boxed.clone(), |_| {
        Ok(TypeDefinition::TypeAlias {
            name: "Box".to_string(),
            generics: vec![GenericInfo {
                name: "T".to_string(),
                constraint: None,
                default: None,
            }],
            value: ParsedType::Standard(StandardType::new("{ value: T }".to_string())),
        })
    })?;
    registry.ensure_definition(size.clone(), |_| Ok(alias("QSize", r#""sm" | "md""#)))?;

    registry.register_reference("Box<string>", "Box", boxed.clone())?;
    registry.register_reference_with_dependencies("Box<QSize>", "Box", boxed, [size])?;

    let definitions = registry.build_type_definitions()?;
    assert_eq!(definitions["Box<string>"], "type Box<T> = { value: T };");
    assert_eq!(
        definitions["Box<QSize>"],
        "type QSize = \"sm\" | \"md\";\n\ntype Box<T> = { value: T };"
    );
    assert_eq!(registry.definition_count(), 2);

    Ok(())
}

#[test]
fn keeps_original_names_for_recursive_and_transitive_import_aliases() -> Result<(), DependencyError>
{
    let mut registry = TypeRegistry::default();
    let node = id("Node");
    let wrapper = id("Wrapper");
    registry.ensure_definition(node.clone(), |registry| {
        registry.register_reference("Node", "Node", node.clone())?;
        Ok(alias("Node", "{ next?: Node }"))
    })?;
    registry.ensure_definition(wrapper.clone(), |registry| {
        registry.register_reference("LocalNode", "LocalNode", node.clone())?;
        Ok(alias("Wrapper", "LocalNode"))
    })?;
    registry.register_reference("Wrapper", "Wrapper", wrapper)?;

    let definitions = registry.build_type_definitions()?;
    assert!(definitions["LocalNode"].contains("type Node = { next?: Node };"));
    assert!(definitions["LocalNode"].contains("type LocalNode = { next?: Node };"));
    assert!(definitions["Wrapper"].contains("type LocalNode = { next?: Node };"));
    Ok(())
}

#[test]
fn rejects_ambiguous_lookup_names() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let first = id("first/Foo");
    let second = id("second/Foo");

    registry.register_reference("Foo", "Foo", first.clone())?;
    let error = registry
        .register_reference("Foo", "Foo", second.clone())
        .unwrap_err();

    assert_eq!(
        error,
        DependencyError::AmbiguousReference {
            lookup_name: "Foo".to_string(),
            first,
            second,
        }
    );

    Ok(())
}

#[test]
fn reports_missing_definitions() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();
    let missing = id("Missing");
    registry.register_reference("Missing", "Missing", missing.clone())?;

    assert_eq!(
        registry.build_type_definitions().unwrap_err(),
        DependencyError::MissingDefinition {
            definition: missing
        }
    );

    Ok(())
}

#[test]
fn terminates_recursive_generic_expansions() -> Result<(), DependencyError> {
    let mut registry = TypeRegistry::default();

    let expanded = registry.expand_reference(id("Node"), |registry| {
        assert!(
            registry
                .expand_reference(id("Node"), |_| Ok::<_, DependencyError>(()))?
                .is_none()
        );
        Ok::<_, DependencyError>("expanded")
    })?;

    assert_eq!(expanded, Some("expanded"));
    assert_eq!(
        registry.expand_reference(id("Node"), |_| Ok::<_, DependencyError>("again"))?,
        Some("again")
    );

    Ok(())
}
