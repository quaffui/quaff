use oxc_semantic::Semantic;

use crate::{
    Result,
    resolver::{PathResolver, dependency::TypeRegistry},
};

pub trait Extractor<T> {
    fn extract(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        registry: &mut TypeRegistry,
    ) -> Result<T>;
}
