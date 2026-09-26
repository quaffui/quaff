use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::{GenericBindings, HeritageInfo},
    resolver::{PathResolver, TypeRegistry},
};

/// Resolves inherited properties and DOM constraints from interface heritage clauses.
pub trait HeritageParser {
    /// Parses inherited types using the current generic bindings and dependency registry.
    fn parse_heritage(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<HeritageInfo>;
}
