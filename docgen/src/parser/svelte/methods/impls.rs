use oxc::{
    ast::{
        AstKind,
        ast::{BindingPattern, Declaration, ExportDeclaration, Function},
    },
    span::Span,
};
use oxc_semantic::{AstNode, Semantic};

use crate::{
    Result,
    extractor::{Extractor, comments::CommentInfo, generics::GenericBindings},
    parser::{
        svelte::{methods::MethodInfo, traits::SvelteParser},
        types::{
            ParsedType, StandardType, TypeParser,
            functions::{FunctionType, FunctionTypeParam},
        },
    },
    resolver::{PathResolver, dependency::TypeRegistry},
};

impl<'a> SvelteParser<'a> for (&'a Function<'a>, Span) {
    type Output = Result<(String, MethodInfo)>;

    fn extract(node: &'a AstNode) -> Option<Self> {
        if let AstKind::ExportDeclaration(ExportDeclaration {
            declaration, span, ..
        }) = node.kind()
            && let Declaration::FunctionDeclaration(func) = declaration
        {
            return Some((func, *span));
        }

        None
    }

    fn parse(&mut self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output {
        let (func, export_span) = *self;
        let Some(name) = &func.id else {
            return Err("Components' exported methods must have names.".into());
        };

        let mut registry = TypeRegistry::new(resolver.0);

        let fn_generics = func
            .type_parameters
            .as_ref()
            .map(|params| params.extract(semantic, resolver, &mut registry))
            .transpose()?
            .unwrap_or_default();
        let fn_bindings = GenericBindings::default().with_shadowed_generics(&fn_generics);

        // This supposes the function has an explicit return type annotation because oxc doesn't automatically infer it
        let return_type = func
            .return_type
            .as_ref()
            .map(|t| {
                t.type_annotation
                    .parse_type(semantic, resolver, &fn_bindings, &mut registry)
            })
            .transpose()?
            .unwrap_or(ParsedType::Standard(StandardType::new("void".to_string())));

        let mut params = Vec::new();

        for param in &func.params.items {
            let Some(annotation) = &param.type_annotation else {
                return Err(format!(
                    "Parameters in function types must have type annotations. Parsing function type: {:?}",
                    func
                )
                .into());
            };

            let BindingPattern::BindingIdentifier(ident) = &param.pattern else {
                return Err(format!(
                    "Parameters that are not identifiers are not currently supported. Parsing parameter: {:?}",
                    param
                )
                .into());
            };

            let parsed = annotation.type_annotation.parse_type(
                semantic,
                resolver,
                &fn_bindings,
                &mut registry,
            )?;

            params.push(FunctionTypeParam {
                name: ident.name.to_string(),
                type_annotation: parsed,
                optional: param.optional,
            });
        }

        let function_type = FunctionType {
            params,
            return_type,
            generics: fn_generics,
        };

        let comment: Option<CommentInfo> = export_span
            .extract(semantic, resolver, &mut registry)?
            .or(func.span.extract(semantic, resolver, &mut registry)?);
        let description = comment
            .map(|c| c.description)
            .unwrap_or_else(|| "No description provided.".to_string());

        let method_info = MethodInfo {
            name: name.to_string(),
            function_type,
            description,
        };

        Ok((name.to_string(), method_info))
    }
}
