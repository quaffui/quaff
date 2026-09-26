use oxc::ast::ast::TSTupleElement;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::GenericBindings,
    resolver::{PathResolver, TypeRegistry},
};

use super::{TupleElement, TypeParser};

/// Parses tuple labels and modifiers around the underlying element type.
pub(super) fn parse_tuple_element(
    element: &TSTupleElement<'_>,
    semantic: &Semantic,
    resolver: &PathResolver,
    generic_bindings: &GenericBindings,
    registry: &mut TypeRegistry,
) -> Result<TupleElement> {
    match element {
        TSTupleElement::TSOptionalType(optional) => Ok(TupleElement {
            label: None,
            type_annotation: optional.type_annotation.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?,
            optional: true,
            rest: false,
        }),
        TSTupleElement::TSRestType(rest) => Ok(TupleElement {
            label: None,
            type_annotation: rest.type_annotation.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?,
            optional: false,
            rest: true,
        }),
        TSTupleElement::TSNamedTupleMember(named) => {
            let mut parsed = parse_tuple_element(
                &named.element_type,
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?;
            parsed.label = Some(named.label.name.to_string());
            parsed.optional |= named.optional;
            Ok(parsed)
        }
        _ => {
            let Some(ts_type) = element.as_ts_type() else {
                return Err(format!("Unsupported tuple element: {element:?}").into());
            };

            Ok(TupleElement {
                label: None,
                type_annotation: ts_type.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?,
                optional: false,
                rest: false,
            })
        }
    }
}
