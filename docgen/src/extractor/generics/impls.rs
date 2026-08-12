use oxc::ast::ast::TSTypeParameterDeclaration;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::Extractor,
    parser::types::{ParsedType, StandardType, TypeParser},
    resolver::{PathResolver, dependency::TypeRegistry},
};

use super::{GenericBindings, GenericBindingsParser, GenericInfo};

impl Extractor<Vec<GenericInfo>> for TSTypeParameterDeclaration<'_> {
    fn extract(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        registry: &mut TypeRegistry,
    ) -> Result<Vec<GenericInfo>> {
        let mut generics: Vec<GenericInfo> = Vec::new();
        let bindings = self.declaration_bindings();

        for param in &self.params {
            let name = param.name.to_string();
            let constraint = param
                .constraint
                .as_ref()
                .map(|t| t.parse_type(semantic, resolver, &bindings, registry))
                .transpose()?;
            let default = param
                .default
                .as_ref()
                .map(|t| t.parse_type(semantic, resolver, &bindings, registry))
                .transpose()?;

            generics.push(GenericInfo {
                name,
                constraint,
                default,
            });
        }

        Ok(generics)
    }
}

impl GenericBindingsParser for TSTypeParameterDeclaration<'_> {
    fn declaration_bindings(&self) -> GenericBindings {
        let mut bindings = GenericBindings::default();

        for param in &self.params {
            let name = param.name.to_string();
            bindings.insert(name.clone(), ParsedType::Standard(StandardType::new(name)));
        }

        bindings
    }

    fn instantiate_bindings(
        &self,
        type_args: &[ParsedType],
        semantic: &Semantic,
        resolver: &PathResolver,
        registry: &mut TypeRegistry,
    ) -> Result<GenericBindings> {
        if type_args.len() > self.params.len() {
            return Err(format!(
                "Expected at most {} generic type arguments but got {}",
                self.params.len(),
                type_args.len()
            )
            .into());
        }

        let mut bindings = self.declaration_bindings();

        for (index, param) in self.params.iter().enumerate() {
            let parsed = if let Some(supplied_type) = type_args.get(index) {
                supplied_type.clone()
            } else if let Some(default) = &param.default {
                default.parse_type(semantic, resolver, &bindings, registry)?
            } else {
                ParsedType::Standard(StandardType::new(param.name.to_string()))
            };

            bindings.insert(param.name.to_string(), parsed);
        }

        Ok(bindings)
    }
}
