use oxc::ast::ast::{FormalParameters, TSFunctionType};
use oxc_semantic::Semantic;

use crate::{
    Result, SpanDisplay,
    extractor::{Extractor, GenericBindings},
    parser::{FunctionTypeParam, ParsedType, StandardType, TypeParser},
    resolver::{PathResolver, TypeRegistry},
};

use super::FunctionType;

impl TypeParser for TSFunctionType<'_> {
    /// Parses a function signature with its own generic parameters in scope.
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

        let params = FunctionTypeParam::parse_parameters(
            &self.params,
            semantic,
            resolver,
            &fn_bindings,
            registry,
        )?;

        let function_type = FunctionType {
            params,
            return_type,
            generics: fn_generics,
        };

        Ok(ParsedType::Function(Box::new(function_type)))
    }
}

impl FunctionTypeParam {
    /// Preserves rest parameters and TypeScript optionality rules for defaulted arguments.
    pub fn parse_parameters(
        parameters: &FormalParameters,
        semantic: &Semantic,
        resolver: &PathResolver,
        bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<Vec<Self>> {
        let mut params = Vec::new();

        for (index, param) in parameters.items.iter().enumerate() {
            let annotation = param
                .type_annotation
                .as_ref()
                .ok_or("Function parameters must have type annotations")?;
            let has_required_following = parameters.items[index + 1..]
                .iter()
                .any(|following| !following.optional && following.initializer.is_none());
            let is_defaulted = param.initializer.is_some();
            let mut type_annotation = annotation
                .type_annotation
                .parse_type(semantic, resolver, bindings, registry)?;

            if is_defaulted && has_required_following {
                type_annotation = ParsedType::Union(vec![
                    type_annotation,
                    ParsedType::Standard(StandardType::new("undefined".to_string())),
                ]);
            }

            params.push(Self {
                name: param.pattern.display(semantic),
                type_annotation,
                optional: param.optional || (is_defaulted && !has_required_following),
            });
        }

        if let Some(param) = &parameters.rest {
            let annotation = param
                .type_annotation
                .as_ref()
                .ok_or("Rest parameters must have type annotations")?;
            params.push(Self {
                name: format!("...{}", param.rest.argument.display(semantic)),
                type_annotation: annotation
                    .type_annotation
                    .parse_type(semantic, resolver, bindings, registry)?,
                optional: false,
            });
        }

        Ok(params)
    }
}
