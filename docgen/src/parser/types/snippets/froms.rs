use crate::parser::types::{
    ParsedType,
    interfaces::{InterfaceProperty, InterfacePropertyFlags},
    snippets::Snippet,
};

impl TryFrom<InterfaceProperty> for Snippet {
    type Error = InterfaceProperty;

    fn try_from(value: InterfaceProperty) -> Result<Self, Self::Error> {
        match value {
            InterfaceProperty {
                key,
                type_annotation: ParsedType::Snippet(params),
                flags,
                comment,
            } => Ok(Snippet {
                name: key.doc_name(),
                description: comment.map(|c| c.description).unwrap_or_default(),
                optional: flags.contains(InterfacePropertyFlags::Optional),
                params,
            }),
            other => Err(other),
        }
    }
}
