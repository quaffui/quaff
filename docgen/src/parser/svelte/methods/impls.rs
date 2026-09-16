use oxc::ast::{
    AstKind,
    ast::{BindingPattern, Declaration, Expression},
};
use oxc_semantic::{AstNode, Semantic};

use crate::{
    Result,
    extractor::{Extractor, comments::CommentInfo, generics::GenericBindings},
    parser::{
        svelte::methods::{ExportedMethod, MethodInfo},
        types::{
            ParsedType, StandardType, TypeParser,
            functions::{FunctionType, FunctionTypeParam},
        },
    },
    resolver::{PathResolver, dependency::TypeRegistry},
};

impl<'a> ExportedMethod<'a> {
    pub fn extract(node: &'a AstNode, semantic: &Semantic) -> Vec<Self> {
        let AstKind::ExportDeclaration(export) = node.kind() else {
            return Vec::new();
        };

        if !matches!(semantic.nodes().parent_kind(node.id()), AstKind::Program(_)) {
            return Vec::new();
        }

        match &export.declaration {
            Declaration::FunctionDeclaration(function) => function
                .id
                .as_ref()
                .map(|name| Self {
                    name: name.name.as_str(),
                    params: &function.params,
                    type_parameters: function.type_parameters.as_deref(),
                    return_type: function.return_type.as_deref(),
                    span: function.span,
                    export_span: export.span,
                })
                .into_iter()
                .collect(),
            Declaration::VariableDeclaration(declaration) => declaration
                .declarations
                .iter()
                .filter_map(|declarator| {
                    let BindingPattern::BindingIdentifier(name) = &declarator.id else {
                        return None;
                    };
                    let Some(Expression::ArrowFunctionExpression(function)) = &declarator.init
                    else {
                        return None;
                    };

                    Some(Self {
                        name: name.name.as_str(),
                        params: &function.params,
                        type_parameters: function.type_parameters.as_deref(),
                        return_type: function.return_type.as_deref(),
                        span: declarator.span,
                        export_span: export.span,
                    })
                })
                .collect(),
            _ => Vec::new(),
        }
    }

    pub fn parse(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
    ) -> Result<(String, MethodInfo)> {
        let mut registry = TypeRegistry::new(resolver.0);

        let fn_generics = self
            .type_parameters
            .as_ref()
            .map(|params| params.extract(semantic, resolver, &mut registry))
            .transpose()?
            .unwrap_or_default();
        let fn_bindings = GenericBindings::default().with_shadowed_generics(&fn_generics);

        // This supposes the function has an explicit return type annotation because oxc doesn't automatically infer it
        let return_type = self
            .return_type
            .as_ref()
            .map(|t| {
                t.type_annotation
                    .parse_type(semantic, resolver, &fn_bindings, &mut registry)
            })
            .transpose()?
            .unwrap_or(ParsedType::Standard(StandardType::new("void".to_string())));

        let params = FunctionTypeParam::parse_parameters(
            self.params,
            semantic,
            resolver,
            &fn_bindings,
            &mut registry,
        )?;

        let function_type = FunctionType {
            params,
            return_type,
            generics: fn_generics,
        };

        let comment: Option<CommentInfo> = self
            .span
            .extract(semantic, resolver, &mut registry)?
            .or(self
                .export_span
                .extract(semantic, resolver, &mut registry)?);
        let description = comment
            .map(|c| c.description)
            .unwrap_or_else(|| "No description provided.".to_string());

        let method_info = MethodInfo {
            name: self.name.to_string(),
            function_type,
            description,
            type_definitions: registry.build_type_definitions()?,
        };

        Ok((self.name.to_string(), method_info))
    }
}
