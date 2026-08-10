use oxc::ast::ast::TSTypeParameterDeclaration;
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::Extractor,
    parser::types::{TypeDependencies, TypeParser},
    resolver::PathResolver,
    transformer::html::ToHtml,
};

use super::GenericInfo;

impl ToHtml for GenericInfo {
    fn to_html(self) -> String {
        let mut vec_result = vec![self.name];

        if let Some(constraint) = self.constraint {
            vec_result.push("extends".to_string());
            vec_result.push(constraint.to_html());
        }

        if let Some(default) = self.default {
            vec_result.push("=".to_string());
            vec_result.push(default.to_html());
        }

        vec_result.join(" ")
    }
}

impl Extractor<Vec<GenericInfo>> for TSTypeParameterDeclaration<'_> {
    fn extract(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        type_deps: &mut TypeDependencies,
    ) -> Result<Vec<GenericInfo>> {
        let mut generics: Vec<GenericInfo> = Vec::new();

        for param in &self.params {
            let name = param.name.to_string();
            let constraint = param
                .constraint
                .as_ref()
                .map(|t| t.parse_type(semantic, resolver, &[], &[], type_deps))
                .transpose()?;
            let default = param
                .default
                .as_ref()
                .map(|t| t.parse_type(semantic, resolver, &[], &[], type_deps))
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
