use oxc_semantic::Semantic;

use crate::{
    extractor::generics::GenericInfo,
    parser::types::{ParsedType, TypeDependencies},
    prelude::*,
    resolver::PathResolver,
};

use super::{Interface, InterfaceProperty};

/// Trait for parsing an interface from a type.
pub trait InterfaceParser {
    /// Parses an interface from a type.
    fn parse(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        type_args: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<Interface> {
        let _ = semantic;
        let _ = resolver;
        let _ = type_args;
        let _ = type_deps;
        Err("This optional trait method should not be used if not implemented.".into())
    }

    fn parse_body(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_args: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<Vec<InterfaceProperty>>;
}
