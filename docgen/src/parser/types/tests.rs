use std::path::Path;

use oxc::ast::AstKind;

use crate::{
    extractor::generics::GenericBindings,
    parser::{
        source::ParseSource,
        types::{
            ParsedType, StandardType, TupleElement, TypeOperatorKind,
            interfaces::{Interface, InterfaceParser, InterfaceProperty, InterfacePropertyKey},
            ts_utilities::{UtilityKVKind, UtilityTKind},
        },
    },
    resolver::{PathResolver, dependency::TypeRegistry},
};

fn parse_interface(source: &str, target: &str) -> Interface {
    let resolver = PathResolver(Path::new("/virtual/fixture.ts"));
    let mut registry = TypeRegistry::new(Path::new("/virtual"));
    let mut parsed = None;

    source
        .to_string()
        .parse_source(|node, semantic| {
            let AstKind::TSInterfaceDeclaration(declaration) = node.kind() else {
                return Ok(false);
            };

            if declaration.id.name != target {
                return Ok(false);
            }

            parsed = Some(declaration.parse(
                semantic,
                &resolver,
                &GenericBindings::default(),
                &mut registry,
            )?);
            Ok(true)
        })
        .unwrap();

    parsed.unwrap_or_else(|| panic!("Interface {target} was not parsed"))
}

fn property<'a>(interface: &'a Interface, name: &str) -> &'a ParsedType {
    interface
        .properties
        .iter()
        .find_map(|property| match &property.key {
            InterfacePropertyKey::Identifier(key) if key == name => Some(&property.type_annotation),
            _ => None,
        })
        .unwrap_or_else(|| panic!("Property {name} was not parsed"))
}

fn literal_properties(parsed: &ParsedType) -> &[InterfaceProperty] {
    let ParsedType::TypeLiteral(properties) = parsed else {
        panic!("Expected type literal, found {parsed:#?}")
    };

    properties
}

fn literal_property<'a>(properties: &'a [InterfaceProperty], name: &str) -> &'a ParsedType {
    properties
        .iter()
        .find_map(|property| match &property.key {
            InterfacePropertyKey::Identifier(key) if key == name => Some(&property.type_annotation),
            _ => None,
        })
        .unwrap_or_else(|| panic!("Literal property {name} was not parsed"))
}

fn assert_standard(parsed: &ParsedType, expected: &str) {
    let ParsedType::Standard(StandardType { name }) = parsed else {
        panic!("Expected standard type {expected}, found {parsed:#?}")
    };

    assert_eq!(name, expected);
}

#[test]
fn parses_template_literal_types_and_string_literals_structurally() {
    let interface = parse_interface(
        r#"
            type CssUnit = "px" | "%";
            type CssValue = `${number}${CssUnit}`;

            interface TemplateProps {
                value: CssValue;
                inline: `img:${string}`;
                literal: "plain";
                noSubstitution: `plain`;
            }
        "#,
        "TemplateProps",
    );

    let ParsedType::Reference(css_value) = property(&interface, "value") else {
        panic!("Expected CssValue reference")
    };
    let ParsedType::TemplateLiteral(template) = css_value.parsed.as_ref() else {
        panic!(
            "Expected parsed CssValue template, found {:#?}",
            css_value.parsed
        )
    };
    assert_eq!(template.head, "");
    assert_eq!(template.spans.len(), 2);
    assert_standard(&template.spans[0].type_annotation, "number");
    let ParsedType::Reference(css_unit) = &template.spans[1].type_annotation else {
        panic!("Expected CssUnit reference")
    };
    assert_eq!(css_unit.name, "CssUnit");
    assert!(matches!(css_unit.parsed.as_ref(), ParsedType::Union(types) if types.len() == 2));

    let ParsedType::TemplateLiteral(inline) = property(&interface, "inline") else {
        panic!("Expected inline template literal")
    };
    assert_eq!(inline.head, "img:");
    assert_eq!(inline.spans.len(), 1);
    assert_standard(&inline.spans[0].type_annotation, "string");

    assert_standard(property(&interface, "literal"), "\"plain\"");
    let ParsedType::TemplateLiteral(no_substitution) = property(&interface, "noSubstitution")
    else {
        panic!("Expected no-substitution template literal")
    };
    assert_eq!(no_substitution.head, "plain");
    assert!(no_substitution.spans.is_empty());
}

#[test]
fn parses_bare_and_parameterized_snippets_structurally() {
    let interface = parse_interface(
        r#"
            interface SnippetProps {
                children?: Snippet;
                item?: Snippet<[{ value: string }]>;
            }
        "#,
        "SnippetProps",
    );

    let ParsedType::Snippet(children) = property(&interface, "children") else {
        panic!("Expected bare Snippet to be parsed structurally")
    };
    assert!(children.is_empty());

    let ParsedType::Snippet(item) = property(&interface, "item") else {
        panic!("Expected parameterized Snippet to be parsed structurally")
    };
    assert_standard(&item["value"], "string");
}

#[test]
fn preserves_type_arguments_on_unresolved_builtin_references() {
    let interface = parse_interface(
        r#"
            type Async<T> = Promise<T>;

            interface AsyncProps {
                callback: () => Promise<void>;
                result: Async<string>;
            }
        "#,
        "AsyncProps",
    );

    let ParsedType::Function(callback) = property(&interface, "callback") else {
        panic!("Expected callback function type")
    };
    assert_standard(&callback.return_type, "Promise<void>");

    let ParsedType::Reference(result) = property(&interface, "result") else {
        panic!("Expected Async reference")
    };
    assert_standard(&result.parsed, "Promise<string>");
}

#[test]
fn substitutes_supplied_and_defaulted_heritage_arguments() {
    let source = r#"
        type QSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";

        interface QSizeable<ToExclude extends QSize | undefined = undefined> {
            size?: Exclude<QSize, ToExclude>;
        }

        interface ChipProps extends QSizeable<"none" | "xs" | "xl"> {}
        interface DefaultProps extends QSizeable {}
    "#;

    let chip = parse_interface(source, "ChipProps");
    let ParsedType::UtilityKV { kind, v, .. } = property(&chip, "size") else {
        panic!("Expected Exclude type")
    };
    assert_eq!(*kind, UtilityKVKind::Exclude);
    let ParsedType::Union(excluded) = v.as_ref() else {
        panic!("Expected supplied exclusion union")
    };
    assert_eq!(excluded.len(), 3);
    assert_standard(&excluded[0], "\"none\"");
    assert_standard(&excluded[1], "\"xs\"");
    assert_standard(&excluded[2], "\"xl\"");

    let defaulted = parse_interface(source, "DefaultProps");
    let ParsedType::Reference(size_ref) = property(&defaulted, "size") else {
        panic!(
            "Expected defaulted Exclude type to simplify to QSize reference, found {:?}",
            property(&defaulted, "size")
        );
    };
    assert_eq!(size_ref.name, "QSize");
}

#[test]
fn simplifies_generic_exclude_and_omit_with_default_undefined() {
    let source = r#"
        type QSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";
        type CssValue = `${number}px`;

        interface Sizeable<ToExclude extends QSize | undefined = undefined> {
            size?: Exclude<QSize, ToExclude> | CssValue | number;
        }

        interface WithOmit<ToOmit extends string | undefined = undefined> {
            data?: Omit<{ a: string; b: number }, ToOmit>;
        }

        interface AvatarProps extends Sizeable {}
        interface OmitProps extends WithOmit {}
    "#;

    let avatar = parse_interface(source, "AvatarProps");
    let ParsedType::Union(size_types) = property(&avatar, "size") else {
        panic!("Expected union type for size");
    };
    assert_eq!(size_types.len(), 3);

    let ParsedType::Reference(qsize_ref) = &size_types[0] else {
        panic!(
            "Expected first union member to be QSize reference, found {:?}",
            size_types[0]
        );
    };
    assert_eq!(qsize_ref.name, "QSize");

    let ParsedType::Reference(css_value_ref) = &size_types[1] else {
        panic!("Expected second union member to be CssValue reference");
    };
    assert_eq!(css_value_ref.name, "CssValue");
    assert_standard(&size_types[2], "number");

    let omit = parse_interface(source, "OmitProps");
    let ParsedType::TypeLiteral(properties) = property(&omit, "data") else {
        panic!("Expected type literal for omitted data");
    };
    assert_eq!(properties.len(), 2);
}

#[test]
fn substitutes_multiple_parameters_and_nested_alias_defaults() {
    let interface = parse_interface(
        r#"
            type Box<T, U = T[]> = { first: T; second: U };
            type Wrapped<T> = Box<T>;
            interface NestedProps { value: Wrapped<"x"> }
        "#,
        "NestedProps",
    );

    let ParsedType::Reference(wrapped) = property(&interface, "value") else {
        panic!("Expected Wrapped reference")
    };
    let ParsedType::Reference(boxed) = wrapped.parsed.as_ref() else {
        panic!("Expected nested Box reference, found {:#?}", wrapped.parsed)
    };
    let properties = literal_properties(boxed.parsed.as_ref());
    assert_standard(literal_property(properties, "first"), "\"x\"");
    let ParsedType::UtilityT { kind, t } = literal_property(properties, "second") else {
        panic!("Expected defaulted array type")
    };
    assert_eq!(*kind, UtilityTKind::Array);
    assert_standard(t, "\"x\"");
}

#[test]
fn substitutes_inside_functions_and_generic_templates() {
    let interface = parse_interface(
        r#"
            type Format<T, U = T> = `value:${T}:${U}`;
            type Mapper<T> = (value: T) => Format<T>;
            interface FunctionProps { mapper: Mapper<number> }
        "#,
        "FunctionProps",
    );

    let ParsedType::Reference(mapper) = property(&interface, "mapper") else {
        panic!("Expected Mapper reference")
    };
    let ParsedType::Function(function) = mapper.parsed.as_ref() else {
        panic!("Expected parsed function")
    };
    assert_eq!(function.params.len(), 1);
    assert_standard(&function.params[0].type_annotation, "number");

    let ParsedType::Reference(format) = &function.return_type else {
        panic!("Expected Format reference")
    };
    let ParsedType::TemplateLiteral(template) = format.parsed.as_ref() else {
        panic!("Expected Format template literal")
    };
    assert_eq!(template.head, "value:");
    assert_eq!(template.spans.len(), 2);
    assert_standard(&template.spans[0].type_annotation, "number");
    assert_standard(&template.spans[1].type_annotation, "number");
}

#[test]
fn forwards_generic_bindings_through_nested_interface_heritage() {
    let interface = parse_interface(
        r#"
            interface Base<T> { value: T }
            interface Middle<U> extends Base<U> {}
            interface Deep<V = string> extends Middle<V> {}
            interface Props extends Deep<boolean> {}
        "#,
        "Props",
    );

    assert_standard(property(&interface, "value"), "boolean");
}

#[test]
fn preserves_unbound_generics_on_root_declarations() {
    let interface = parse_interface(
        r#"interface GenericProps<T = "fallback"> { value: T }"#,
        "GenericProps",
    );

    assert_standard(property(&interface, "value"), "T");
}

#[test]
fn substitutes_inside_tuple_operator_indexed_and_conditional_types() {
    let interface = parse_interface(
        r#"
            type Shape<T> = {
                tuple: [first: T, ...T[]];
                key: keyof T;
                lookup: T[keyof T];
                conditional: T extends string ? T[] : readonly T[];
            };
            interface StructuralProps { value: Shape<"x"> }
        "#,
        "StructuralProps",
    );

    let ParsedType::Reference(shape) = property(&interface, "value") else {
        panic!("Expected Shape reference")
    };
    let properties = literal_properties(shape.parsed.as_ref());

    let ParsedType::Tuple(tuple) = literal_property(properties, "tuple") else {
        panic!("Expected tuple")
    };
    assert_eq!(tuple.len(), 2);
    let TupleElement {
        label,
        type_annotation,
        optional,
        rest,
    } = &tuple[0];
    assert_eq!(label.as_deref(), Some("first"));
    assert!(!optional && !rest);
    assert_standard(type_annotation, "\"x\"");
    assert!(tuple[1].rest);
    let ParsedType::UtilityT { kind, t } = &tuple[1].type_annotation else {
        panic!("Expected rest array")
    };
    assert_eq!(*kind, UtilityTKind::Array);
    assert_standard(t, "\"x\"");

    let ParsedType::TypeOperator {
        kind,
        type_annotation,
    } = literal_property(properties, "key")
    else {
        panic!("Expected keyof operator")
    };
    assert_eq!(*kind, TypeOperatorKind::Keyof);
    assert_standard(type_annotation, "\"x\"");

    let ParsedType::IndexedAccess { object, index } = literal_property(properties, "lookup") else {
        panic!("Expected indexed access")
    };
    assert_standard(object, "\"x\"");
    assert!(matches!(
        index.as_ref(),
        ParsedType::TypeOperator {
            kind: TypeOperatorKind::Keyof,
            ..
        }
    ));

    let ParsedType::Conditional {
        check,
        true_type,
        false_type,
        ..
    } = literal_property(properties, "conditional")
    else {
        panic!("Expected conditional type")
    };
    assert_standard(check, "\"x\"");
    assert!(matches!(
        true_type.as_ref(),
        ParsedType::UtilityT {
            kind: UtilityTKind::Array,
            ..
        }
    ));
    assert!(matches!(
        false_type.as_ref(),
        ParsedType::TypeOperator {
            kind: TypeOperatorKind::Readonly,
            ..
        }
    ));
}

#[test]
fn recursive_generic_aliases_terminate_with_a_shallow_reference() {
    let interface = parse_interface(
        r#"
            type Node<T> = { value: T; next?: Node<T> };
            interface RecursiveProps { node: Node<string> }
        "#,
        "RecursiveProps",
    );

    let ParsedType::Reference(node) = property(&interface, "node") else {
        panic!("Expected Node reference")
    };
    let properties = literal_properties(node.parsed.as_ref());
    assert_standard(literal_property(properties, "value"), "string");
    let ParsedType::Reference(next) = literal_property(properties, "next") else {
        panic!("Expected recursive Node reference")
    };
    assert_standard(next.parsed.as_ref(), "Node");
}
