use oxc::ast::ast::TSTypeReference;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::GenericBindings,
    parser::{ParsedType, UtilityType},
    resolver::{PathResolver, TypeRegistry},
};

/// Converts TypeScript AST types into the shared documentation type model.
pub trait TypeParser {
    /// Parses this type while resolving generics and recording referenced definitions.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType>;
}

/// Parses recognized TypeScript utility type references.
pub trait UtilityTypeParser {
    /// Parses utility arguments and applies supported structural simplifications.
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
