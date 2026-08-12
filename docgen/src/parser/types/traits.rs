use oxc::ast::ast::TSTypeReference;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::generics::GenericBindings,
    parser::types::{ParsedType, ts_utilities::UtilityType},
    resolver::{PathResolver, dependency::TypeRegistry},
};

pub trait TypeParser {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType>;
}

pub trait UtilityTypeParser {
    fn parse_utility_type(
        &self,
        kind: UtilityType,
        reference: &TSTypeReference,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType>;
}
