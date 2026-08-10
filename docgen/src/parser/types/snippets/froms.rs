use crate::parser::types::{
    ParsedType,
    interfaces::{InterfaceProperty, InterfacePropertyFlags},
    snippets::Snippet,
};

impl TryFrom<InterfaceProperty> for Snippet {
    type Error = InterfaceProperty;

    fn try_from(value: InterfaceProperty) -> Result<Self, Self::Error> {
        if matches!(value.type_annotation, ParsedType::Snippet(_)) {
            let InterfaceProperty {
                name,
                type_annotation,
                flags,
                comment,
                ..
            } = value;

            let ParsedType::Snippet(params) = type_annotation else {
                unreachable!();
            };

            let snippet = Snippet {
                name,
                description: comment.unwrap_or_default().description,
                optional: flags.contains(InterfacePropertyFlags::Optional),
                params,
            };

            Ok(snippet)
        } else {
            Err(value)
        }
    }
}
