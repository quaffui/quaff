use crate::parser::UtilityTKind;

use std::collections::HashMap;

use crate::{
    extractor::GenericInfo,
    parser::{
        FunctionType, FunctionTypeParam, Interface, InterfaceProperty, InterfacePropertyFlags,
        InterfacePropertyKey, ParsedType, StandardType, TemplateLiteralSpan, TemplateLiteralType,
        TupleElement, TypeOperatorKind, UtilityKVKind,
    },
    resolver::TypeDefinition,
};

use super::*;

fn standard(name: &str) -> ParsedType {
    ParsedType::Standard(StandardType::new(name.to_string()))
}

fn property(name: &str, parsed: ParsedType, optional: bool) -> InterfaceProperty {
    InterfaceProperty {
        key: InterfacePropertyKey::Identifier(name.to_string()),
        type_annotation: parsed,
        flags: if optional {
            InterfacePropertyFlags::OPTIONAL
        } else {
            InterfacePropertyFlags::NONE
        },
        comment: None,
    }
}

#[test]
fn renders_template_literals_structurally() {
    let parsed = ParsedType::TemplateLiteral(TemplateLiteralType {
        head: "url(".to_string(),
        spans: vec![
            TemplateLiteralSpan {
                type_annotation: standard("string"),
                literal: ") ".to_string(),
            },
            TemplateLiteralSpan {
                type_annotation: standard("number"),
                literal: "px".to_string(),
            },
        ],
    });

    assert_eq!(parsed.to_ts(), "`url(${string}) ${number}px`");
}

#[test]
fn parenthesizes_types_according_to_precedence() {
    let union = ParsedType::Union(vec![standard("A"), standard("B")]);
    let array = ParsedType::UtilityT {
        kind: UtilityTKind::Array,
        t: Box::new(union),
    };
    assert_eq!(array.to_ts(), "(A | B)[]");

    let function = ParsedType::Function(Box::new(FunctionType {
        params: Vec::new(),
        return_type: standard("void"),
        generics: Vec::new(),
    }));
    let union = ParsedType::Union(vec![function, standard("string")]);
    assert_eq!(union.to_ts(), "(() => void) | string");

    let intersection = ParsedType::Intersection(vec![
        ParsedType::Union(vec![standard("A"), standard("B")]),
        standard("C"),
    ]);
    assert_eq!(intersection.to_ts(), "(A | B) & C");
}

#[test]
fn renders_utilities_operators_indexed_access_and_conditionals() {
    let utility = ParsedType::UtilityKV {
        kind: UtilityKVKind::Exclude,
        k: Box::new(standard("QSize")),
        v: Box::new(standard("\"none\"")),
    };
    assert_eq!(utility.to_ts(), "Exclude<QSize, \"none\">");

    let indexed = ParsedType::IndexedAccess {
        object: Box::new(ParsedType::TypeOperator {
            kind: TypeOperatorKind::Keyof,
            type_annotation: Box::new(standard("T")),
        }),
        index: Box::new(standard("\"name\"")),
    };
    assert_eq!(indexed.to_ts(), "(keyof T)[\"name\"]");

    let conditional = ParsedType::Conditional {
        check: Box::new(standard("T")),
        extends: Box::new(standard("string")),
        true_type: Box::new(standard("A")),
        false_type: Box::new(standard("B")),
    };
    assert_eq!(conditional.to_ts(), "T extends string ? A : B");
}

#[test]
fn renders_tuples_and_functions() {
    let tuple = ParsedType::Tuple(vec![
        TupleElement {
            label: Some("value".to_string()),
            type_annotation: standard("string"),
            optional: true,
            rest: false,
        },
        TupleElement {
            label: Some("rest".to_string()),
            type_annotation: standard("number[]"),
            optional: false,
            rest: true,
        },
    ]);
    assert_eq!(tuple.to_ts(), "[value?: string, ...rest: number[]]");

    let function = ParsedType::Function(Box::new(FunctionType {
        params: vec![FunctionTypeParam {
            name: "value".to_string(),
            type_annotation: standard("T"),
            optional: false,
        }],
        return_type: standard("T"),
        generics: vec![GenericInfo {
            name: "T".to_string(),
            constraint: Some(standard("string")),
            default: None,
        }],
    }));
    assert_eq!(function.to_ts(), "<T extends string>(value: T) => T");
}

#[test]
fn renders_snippet_parameters_deterministically() {
    let mut params = HashMap::new();
    params.insert("zebra".to_string(), standard("number"));
    params.insert("alpha".to_string(), standard("string"));

    assert_eq!(
        ParsedType::Snippet(params).to_ts(),
        "Snippet<[{ alpha: string; zebra: number }]>"
    );
}

#[test]
fn renders_alias_generics_constraints_and_defaults() {
    let definition = TypeDefinition::TypeAlias {
        name: "Box".to_string(),
        generics: vec![GenericInfo {
            name: "T".to_string(),
            constraint: Some(standard("Serializable")),
            default: Some(standard("string")),
        }],
        value: ParsedType::TypeLiteral(vec![property("value", standard("T"), false)]),
    };

    assert_eq!(
        definition.to_ts_definition(),
        "type Box<T extends Serializable = string> = {\n  value: T;\n};"
    );
}

#[test]
fn renders_interfaces_with_optional_and_index_properties() {
    let definition = TypeDefinition::Interface(Interface {
        name: "Dictionary".to_string(),
        generics: vec![GenericInfo {
            name: "T".to_string(),
            constraint: None,
            default: None,
        }],
        properties: vec![
            property("selected", standard("T"), true),
            InterfaceProperty {
                key: InterfacePropertyKey::IndexSignature {
                    name: "key".to_string(),
                    type_annotation: standard("string"),
                },
                type_annotation: standard("T"),
                flags: InterfacePropertyFlags::NONE,
                comment: None,
            },
            InterfaceProperty {
                key: InterfacePropertyKey::IndexSignature {
                    name: "optionalKey".to_string(),
                    type_annotation: standard("number"),
                },
                type_annotation: standard("T"),
                flags: InterfacePropertyFlags::OPTIONAL,
                comment: None,
            },
        ],
        dom_props_heritage: Some(Box::new(standard("Base"))),
    });

    assert_eq!(
        definition.to_ts_definition(),
        "interface Dictionary<T> extends Base {\n  selected?: T;\n  [key: string]: T;\n  [optionalKey: number]: T | undefined;\n}"
    );
    assert_eq!(
        definition.to_ts_definition_as("LocalDictionary"),
        "interface LocalDictionary<T> extends Base {\n  selected?: T;\n  [key: string]: T;\n  [optionalKey: number]: T | undefined;\n}"
    );
}

#[test]
fn preserves_optional_tuple_index_and_conditional_grouping() {
    let function = || {
        ParsedType::Function(Box::new(FunctionType {
            params: Vec::new(),
            return_type: standard("string"),
            generics: Vec::new(),
        }))
    };
    let tuple = ParsedType::Tuple(vec![TupleElement {
        label: None,
        type_annotation: ParsedType::Union(vec![standard("string"), standard("number")]),
        optional: true,
        rest: false,
    }]);
    assert_eq!(tuple.to_ts(), "[(string | number)?]");

    let index = InterfaceProperty {
        key: InterfacePropertyKey::IndexSignature {
            name: "key".to_string(),
            type_annotation: standard("string"),
        },
        type_annotation: function(),
        flags: InterfacePropertyFlags::OPTIONAL,
        comment: None,
    };
    assert_eq!(index.to_ts(), "[key: string]: (() => string) | undefined;");

    let conditional = ParsedType::Conditional {
        check: Box::new(function()),
        extends: Box::new(function()),
        true_type: Box::new(standard("true")),
        false_type: Box::new(standard("false")),
    };
    assert_eq!(
        conditional.to_ts(),
        "(() => string) extends (() => string) ? true : false"
    );
}
