use super::model::TypeSrcMapping;

pub static TYPE_SRC_MAPPINGS: [TypeSrcMapping; 15] = [
    TypeSrcMapping::new_string("MaterialSymbol", "https://fonts.google.com/icons"),
    TypeSrcMapping::new_string(
        "BundledLanguage",
        "https://shiki.style/languages#bundled-languages",
    ),
    TypeSrcMapping::new_string(
        "SpecialLanguage",
        "https://shiki.style/languages#special-languages",
    ),
    TypeSrcMapping::new_string("BundledTheme", "https://shiki.style/themes#bundled-themes"),
    TypeSrcMapping::new_string(
        "Snippet",
        "https://svelte.dev/docs/svelte/snippet#Typing-snippets",
    ),
    TypeSrcMapping::new_string(
        "HTMLElementTagNameMap",
        "https://typhonjs-typedoc.github.io/ts-lib-docs/2024/dom/interfaces/HTMLElementTagNameMap.html",
    ),
    TypeSrcMapping::new_regex(
        r#"^Attachment(<.*?>)?"#,
        "https://svelte.dev/docs/svelte/svelte-attachments#Attachment",
    ),
    TypeSrcMapping::new_regex(
        r#"^(?<event>[A-Z][a-z]+Event)Handler<.*>$"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/${event}",
    ),
    TypeSrcMapping::new_regex(
        r#"^(?<element>HTML(?:.+)?Element)$"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/${element}",
    ),
    // Specific indexed patterns must come before their general counterparts
    // so that `.find()` matches them first (replaces the former look-ahead).
    TypeSrcMapping::new_regex(
        r#"HTML(?<element>.+)Attributes\["(?<prop>\w+)"\]"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}",
    ),
    TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTMLElement>\["(?<prop>\w+)"\]"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Global_attributes/${prop}",
    ),
    TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTML(?<element>.+)Element>\["(?<prop>\w+)"\]"#,
        "https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}",
    ),
    // General (non-indexed) patterns come after their indexed variants.
    TypeSrcMapping::new_regex(
        r#"^HTMLAttributes<HTMLElement>$"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Global_attributes#list_of_global_attributes",
    ),
    TypeSrcMapping::new_regex(
        r#"HTMLAttributes<HTML(?<element>.+)Element>"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Elements/${element}#attributes",
    ),
    TypeSrcMapping::new_regex(
        r#"HTML(?<element>.+)Attributes"#,
        "https://developer.mozilla.org/en-us/docs/Web/HTML/Reference/Elements/${element}#attributes",
    ),
];
