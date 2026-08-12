use oxc::allocator::Vec as OxcVec;
use oxc::ast::ast::TSInterfaceHeritage;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::{generics::GenericBindings, heritage::HeritageInfo},
    resolver::{PathResolver, dependency::TypeRegistry},
};

pub trait HeritageParser {
    fn parse_heritage(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<HeritageInfo>;
}

impl HeritageParser for OxcVec<'_, TSInterfaceHeritage<'_>> {
    fn parse_heritage(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<HeritageInfo> {
        super::impls::parse_heritage(self, semantic, resolver, generic_bindings, registry)
    }
}
