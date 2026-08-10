use oxc::ast::ast::TSTypeReference;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::generics::GenericInfo,
    parser::types::{ParsedType, TypeDependencies, ts_utilities::UtilityType},
    resolver::PathResolver,
};

pub trait TypeParser {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType>;
}

pub trait UtilityTypeParser {
    fn parse_utility_type(
        &self,
        kind: UtilityType,
        reference: &TSTypeReference,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType>;
}
