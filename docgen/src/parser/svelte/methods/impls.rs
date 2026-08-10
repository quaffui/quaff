use std::collections::HashMap;

use oxc::ast::{
    AstKind,
    ast::{BindingPattern, Declaration, ExportDeclaration, Function},
};
use oxc_semantic::{AstNode, Semantic};

use crate::{
    Result,
    extractor::Extractor,
    parser::{
        svelte::traits::SvelteParser,
        types::{
            ParsedType, StandardType, TypeParser,
            functions::{FunctionType, FunctionTypeParam},
        },
    },
    resolver::PathResolver,
};

impl<'a> SvelteParser<'a> for &'a Function<'a> {
    type Output = Result<(String, FunctionType)>;

    fn extract(node: &'a AstNode) -> Option<Self> {
        if let AstKind::ExportDeclaration(ExportDeclaration { declaration, .. }) = node.kind()
            && let Declaration::FunctionDeclaration(func) = declaration
        {
            return Some(func);
        }

        None
    }

    fn parse(&mut self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output {
        let Some(name) = &self.id else {
            return Err("Components' exported methods must have names.".into());
        };

        let mut type_deps = HashMap::new();

        let fn_generics = self
            .type_parameters
            .as_ref()
            .map(|params| params.extract(semantic, resolver, &mut type_deps))
            .transpose()?
            .unwrap_or_default();

        // This supposes the function has an explicit return type annotation because oxc doesn't automatically infer it
        let return_type = self
            .return_type
            .as_ref()
            .map(|t| {
                t.type_annotation
                    .parse_type(semantic, resolver, &[], &[], &mut type_deps)
            })
            .transpose()?
            .unwrap_or(ParsedType::Standard(StandardType::new("void".to_string())));

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
                &[],
                &[],
                &mut type_deps,
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

        Ok((name.to_string(), function_type))
    }
}
