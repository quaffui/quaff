use oxc::ast::ast::{BindingPattern, TSFunctionType};
use oxc_semantic::Semantic;

use crate::{
    Result,
    extractor::{Extractor, generics::GenericBindings},
    parser::types::{ParsedType, TypeParser, functions::FunctionTypeParam},
    resolver::{PathResolver, dependency::TypeRegistry},
};

use super::FunctionType;

impl TypeParser for TSFunctionType<'_> {
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        let fn_generics = self
            .type_parameters
            .as_ref()
            .map(|params| params.extract(semantic, resolver, registry))
            .transpose()?
            .unwrap_or_default();

        let fn_bindings = generic_bindings.with_shadowed_generics(&fn_generics);

        let return_type = self.return_type.type_annotation.parse_type(
            semantic,
            resolver,
            &fn_bindings,
            registry,
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
                &fn_bindings,
                registry,
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
