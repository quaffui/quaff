use super::TypeSrcMapping;

#[test]
fn string_mapping_returns_the_documentation_url() {
    let mapping = TypeSrcMapping::new_string("Thing", "https://example.test/Thing");

    assert_eq!(
        mapping.map("Thing"),
        (
            "Thing".to_string(),
            "https://example.test/Thing".to_string()
        )
    );
}

#[test]
fn lowercases_html_element_names_in_mdn_attribute_urls() {
    let mapping = TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTML(?<element>.+)Element>"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Elements/${element}#attributes",
    );

    assert_eq!(
        mapping.map("HTMLAttributes<HTMLDivElement>"),
        (
            "HTMLAttributes<HTMLDivElement>".to_string(),
            "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Elements/div#attributes"
                .to_string(),
        )
    );
}

#[test]
fn maps_html_attributes_nested_in_a_utility_type() {
    let mapping = TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTMLElement>"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Global_attributes",
    );

    assert_eq!(
        mapping.map(r#"Omit<HTMLAttributes<HTMLElement>, "children">"#),
        (
            "HTMLAttributes<HTMLElement>".to_string(),
            "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Global_attributes"
                .to_string(),
        )
    );
}
