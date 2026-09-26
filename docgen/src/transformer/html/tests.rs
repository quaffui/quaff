use std::collections::HashMap;

use crate::{
    extractor::CommentInfo,
    parser::{
        ExternalType, InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey, ParsedType,
        ReferenceType, Snippet, StandardType,
    },
};

use super::{HtmlItem, QApiPropInfo, ToHtml};

#[test]
fn escapes_text_and_attributes() {
    let item = HtmlItem::new(r#"<script>"'&"#)
        .tag("span")
        .class(r#"type" onclick="bad"#)
        .create_item();

    assert_eq!(
        item,
        r#"<span class="type&quot; onclick=&quot;bad">&lt;script&gt;&quot;&#39;&amp;</span>"#
    );
}

#[test]
fn escapes_reference_names_and_external_urls() {
    let reference = ParsedType::Reference(ReferenceType {
        name: r#"A" onmouseover="bad"#.to_string(),
        type_args: Vec::new(),
        parsed: Box::new(ParsedType::Standard(StandardType {
            name: "string".to_string(),
        })),
    })
    .to_html();
    let external = ExternalType {
        name: "Type<unsafe>".to_string(),
        type_src: r#"https://example.test/?q="<&"#.to_string(),
    }
    .to_html();

    assert_eq!(
        reference,
        r#"<span class="clickable" data-quaff tabindex="0" data-type-name="A&quot; onmouseover=&quot;bad">A&quot; onmouseover=&quot;bad</span>"#
    );
    assert_eq!(
        external,
        r#"<a class="clickable link" href="https://example.test/?q=&quot;&lt;&amp;" target="_blank">Type&lt;unsafe&gt;</a>"#
    );
}

#[test]
fn preserves_operator_precedence_in_html() {
    use crate::parser::{TypeOperatorKind, UtilityTKind};
    use crate::transformer::ToTs;

    let standard = |name: &str| ParsedType::Standard(StandardType::new(name.to_string()));
    let union = || ParsedType::Union(vec![standard("A"), standard("B")]);
    let cases = [
        ParsedType::IndexedAccess {
            object: Box::new(union()),
            index: Box::new(standard("0")),
        },
        ParsedType::TypeOperator {
            kind: TypeOperatorKind::Keyof,
            type_annotation: Box::new(union()),
        },
        ParsedType::UtilityT {
            kind: UtilityTKind::Array,
            t: Box::new(ParsedType::TypeOperator {
                kind: TypeOperatorKind::Readonly,
                type_annotation: Box::new(ParsedType::UtilityT {
                    kind: UtilityTKind::Array,
                    t: Box::new(standard("string")),
                }),
            }),
        },
    ];

    for parsed in cases {
        assert_eq!(parsed.clone().to_html(), parsed.to_ts());
    }
}

#[test]
fn renders_snippet_types_inside_other_type_expressions() {
    let bare = ParsedType::Snippet(HashMap::new()).to_html();
    let parameterized = ParsedType::Snippet(HashMap::from([(
        "value".to_string(),
        ParsedType::Standard(StandardType::new("string".to_string())),
    )]))
    .to_html();

    assert!(bare.contains(">Snippet</a>"));
    assert!(parameterized.contains(">Snippet</a>&lt;[{ value: string }]&gt;"));
}

#[test]
fn preserves_optional_tuple_index_and_conditional_grouping() {
    use crate::parser::{
        FunctionType, InterfaceProperty, InterfacePropertyFlags, InterfacePropertyKey, TupleElement,
    };

    let standard = |name: &str| ParsedType::Standard(StandardType::new(name.to_string()));
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
    assert_eq!(tuple.to_html(), "[(string | number)?]");

    let index = ParsedType::TypeLiteral(vec![InterfaceProperty {
        key: InterfacePropertyKey::IndexSignature {
            name: "key".to_string(),
            type_annotation: standard("string"),
        },
        type_annotation: function(),
        flags: InterfacePropertyFlags::OPTIONAL,
        comment: None,
    }]);
    assert_eq!(
        index.to_html(),
        "{ [key: string]: (() =&gt; string) | undefined }"
    );

    let conditional = ParsedType::Conditional {
        check: Box::new(function()),
        extends: Box::new(function()),
        true_type: Box::new(standard("true")),
        false_type: Box::new(standard("false")),
    };
    assert_eq!(
        conditional.to_html(),
        "(() =&gt; string) extends (() =&gt; string) ? true : false"
    );
}

#[test]
fn escapes_property_headers_but_preserves_description_html() {
    let property = InterfaceProperty {
        key: InterfacePropertyKey::Identifier("unsafe<name>".to_string()),
        type_annotation: ParsedType::Standard(StandardType {
            name: r#""<value>""#.to_string(),
        }),
        flags: InterfacePropertyFlags::OPTIONAL,
        comment: Some(CommentInfo {
            description: "Use <code>trusted</code>.".to_string(),
            default: Some("<script>alert('bad')</script>".to_string()),
        }),
    };

    let info = QApiPropInfo::try_from(property).expect("property should render");

    assert_eq!(info.name, "unsafe<name>");
    assert_eq!(info.description, "Use <code>trusted</code>.");
    assert!(info.header.contains("unsafe&lt;name&gt;"));
    assert!(info.header.contains("&quot;&lt;value&gt;&quot;"));
    assert!(
        info.header
            .contains("&lt;script&gt;alert(&#39;bad&#39;)&lt;/script&gt;")
    );
    assert!(!info.header.contains("<script>"));
}

#[test]
fn renders_empty_and_named_snippet_parameters() {
    let empty = QApiPropInfo::from(Snippet {
        name: "empty".to_string(),
        optional: true,
        description: String::new(),
        params: HashMap::new(),
    });
    let named = QApiPropInfo::from(Snippet {
        name: "named".to_string(),
        optional: false,
        description: String::new(),
        params: HashMap::from([
            (
                "zeta".to_string(),
                ParsedType::Standard(StandardType {
                    name: "number".to_string(),
                }),
            ),
            (
                "alpha".to_string(),
                ParsedType::Standard(StandardType {
                    name: "string".to_string(),
                }),
            ),
        ]),
    });

    assert!(empty.header.contains("?.()"));
    assert!(!empty.header.contains("{  }"));
    assert!(named.header.contains("({ alpha: string, zeta: number })"));
}

#[test]
fn renders_index_signature_property_with_template_literal_name() {
    let property = InterfaceProperty {
        key: InterfacePropertyKey::IndexSignature {
            name: "key".to_string(),
            type_annotation: ParsedType::TemplateLiteral(crate::parser::TemplateLiteralType {
                head: "bodyCell".to_string(),
                spans: vec![crate::parser::TemplateLiteralSpan {
                    type_annotation: ParsedType::Standard(StandardType {
                        name: "string".to_string(),
                    }),
                    literal: String::new(),
                }],
            }),
        },
        type_annotation: ParsedType::Standard(StandardType {
            name: "string".to_string(),
        }),
        flags: InterfacePropertyFlags::OPTIONAL,
        comment: None,
    };

    let info = QApiPropInfo::try_from(property).expect("index signature prop");

    assert_eq!(info.name, "bodyCell{string}");
    assert!(info.header.contains("<b>bodyCell{string}</b>"));
    assert!(info.header.contains("?: "));
}
