use oxc::ast::ast::{BindingPattern, TSFunctionType};
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::{Extractor, generics::GenericInfo},
    parser::types::{ParsedType, TypeDependencies, TypeParser, functions::FunctionTypeParam},
    resolver::PathResolver,
};

use super::FunctionType;

impl TypeParser for TSFunctionType<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generics: &[GenericInfo],
        type_arg: &[ParsedType],
        type_deps: &mut TypeDependencies,
    ) -> Result<ParsedType> {
        let fn_generics = self
            .type_parameters
            .as_ref()
            .map(|params| params.extract(semantic, resolver, type_deps))
            .transpose()?
            .unwrap_or_default();

        let all_generics = [generics.to_vec(), fn_generics.clone()].concat();

        let return_type = self.return_type.type_annotation.parse_type(
            semantic,
            resolver,
            &all_generics,
            type_arg,
            type_deps,
        )?;

        let mut params = Vec::new();

        for param in &self.params.items {
            let Some(annotation) = &param.type_annotation else {
                return Err(format!(
                "Parameters in function types must have type annotations. Parsing function type: {:?}",
                self
            )
            .into());
            };

            let BindingPattern::BindingIdentifier(ident) = &param.pattern else {
                return Err(format!("Parameters that are not identifiers are not currently supported. Parsing parameter: {:?}", param).into());
            };

            let parsed = annotation.type_annotation.parse_type(
                semantic,
                resolver,
                &all_generics,
                type_arg,
                type_deps,
            )?;

            params.push(FunctionTypeParam {
                name: ident.name.to_string(),
                type_annotation: parsed,
                optional: param.optional,
            })
        }

        let function_type = FunctionType {
            params,
            return_type,
            generics: fn_generics,
        };

        Ok(ParsedType::Function(Box::new(function_type)))
    }
}
