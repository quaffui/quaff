use oxc_semantic::Semantic;

use crate::{Result, parser::types::TypeDependencies, resolver::PathResolver};

pub trait Extractor<T> {
    fn extract(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        type_deps: &mut TypeDependencies,
    ) -> Result<T>;
}
