use std::{collections::HashMap, str::FromStr};

use oxc::{
    ast::{
        AstKind,
        ast::{
            BindingPattern, TSArrayType, TSConditionalType, TSIndexedAccessType,
            TSIntersectionType, TSLiteral, TSLiteralType, TSMappedType, TSParenthesizedType,
            TSTemplateLiteralType, TSTupleElement, TSTupleType, TSType, TSTypeName, TSTypeOperator,
            TSTypeOperatorOperator, TSTypeQuery, TSTypeQueryExprName, TSTypeReference, TSUnionType,
        },
    },
    span::GetSpan,
};
use oxc_semantic::Semantic;

use crate::{
    Result, SpanDisplay,
    extractor::{Extractor, GenericBindings, GenericBindingsParser, GenericInfo},
    resolver::{
        DefinitionKind, PathResolver, ReferenceResolver, ResolvedReference, TypeDefinition,
        TypeRegistry,
    },
    transformer::{TYPE_SRC_MAPPINGS, ToTs},
};

use super::{
    ExternalType, InterfaceParser, ParsedType, ReferenceType, StandardType, TemplateLiteralSpan,
    TemplateLiteralType, TupleElement, TypeOperatorKind, TypeParser, UtilityKVKind, UtilityTKind,
    UtilityType, UtilityTypeParser, funcs::parse_tuple_element,
};

impl StandardType {
    /// Stores the original spelling of a primitive or unresolved type.
    pub fn new(name: String) -> Self {
        Self { name }
    }
}

impl ExternalType {
    /// Creates an external type when its name matches a documentation mapping.
    pub fn maybe_new(name: String) -> Option<Self> {
        let maybe_src_mapping = TYPE_SRC_MAPPINGS.iter().find(|m| m.matches(&name));

        if let Some(src_mapping) = maybe_src_mapping {
            let (type_name, type_src) = src_mapping.map(&name);

            return Some(Self {
                name: type_name,
                type_src,
            });
        }

        None
    }
}

impl ParsedType {
    /// Checks whether this type represents `undefined` or `never`.
    pub fn is_undefined_or_never(&self) -> bool {
        match self {
            Self::Standard(standard) => {
                let name = standard.name.trim();
                name == "undefined" || name == "never"
            }
            Self::Reference(reference) => {
                let name = reference.name.trim();
                name == "undefined" || name == "never" || reference.parsed.is_undefined_or_never()
            }
            Self::Union(types) => {
                !types.is_empty() && types.iter().all(Self::is_undefined_or_never)
            }
            _ => false,
        }
    }
}

impl TypeParser for TSParenthesizedType<'_> {
    /// Parses the enclosed type without retaining redundant parentheses.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> crate::Result<ParsedType> {
        self.type_annotation
            .parse_type(semantic, resolver, generic_bindings, registry)
    }
}

impl TypeParser for TSUnionType<'_> {
    /// Parses each alternative in a union.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> crate::Result<ParsedType> {
        let parsed = self
            .types
            .iter()
            .map(|t| t.parse_type(semantic, resolver, generic_bindings, registry))
            .collect::<Result<Vec<ParsedType>>>()?;
        Ok(ParsedType::Union(parsed))
    }
}

impl TypeParser for TSIntersectionType<'_> {
    /// Parses every member of an intersection.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> crate::Result<ParsedType> {
        let parsed = self
            .types
            .iter()
            .map(|t| t.parse_type(semantic, resolver, generic_bindings, registry))
            .collect::<Result<Vec<ParsedType>>>()?;
        Ok(ParsedType::Intersection(parsed))
    }
}

impl TypeParser for TSArrayType<'_> {
    /// Represents an array as its equivalent single-argument utility type.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        let parsed =
            self.element_type
                .parse_type(semantic, resolver, generic_bindings, registry)?;
        Ok(ParsedType::UtilityT {
            kind: UtilityTKind::Array,
            t: Box::new(parsed),
        })
    }
}

impl TypeParser for TSTemplateLiteralType<'_> {
    /// Preserves literal segments and recursively parses interpolated types.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        if self.quasis.len() != self.types.len() + 1 {
            return Err(format!(
                "Invalid template literal type: expected one more literal segment than type spans, found {} segments and {} spans",
                self.quasis.len(),
                self.types.len()
            )
            .into());
        }

        let Some(head) = self.quasis.first() else {
            return Err("Template literal type has no literal segments".into());
        };
        let spans = self
            .types
            .iter()
            .zip(self.quasis.iter().skip(1))
            .map(|(ts_type, literal)| {
                Ok(TemplateLiteralSpan {
                    type_annotation: ts_type.parse_type(
                        semantic,
                        resolver,
                        generic_bindings,
                        registry,
                    )?,
                    literal: literal.value.raw.to_string(),
                })
            })
            .collect::<Result<Vec<TemplateLiteralSpan>>>()?;

        Ok(ParsedType::TemplateLiteral(TemplateLiteralType {
            head: head.value.raw.to_string(),
            spans,
        }))
    }
}

impl TypeParser for TSLiteralType<'_> {
    /// Preserves literal spellings, including templates without substitutions.
    fn parse_type(
        &self,
        semantic: &Semantic,
        _resolver: &PathResolver,
        _generic_bindings: &GenericBindings,
        _registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        if let TSLiteral::TemplateLiteral(template) = &self.literal {
            let Some(head) = template.quasis.first() else {
                return Err("Template literal type has no literal segments".into());
            };

            if !template.expressions.is_empty() || template.quasis.len() != 1 {
                return Err("Expected a no-substitution template literal type".into());
            }

            return Ok(ParsedType::TemplateLiteral(TemplateLiteralType {
                head: head.value.raw.to_string(),
                spans: Vec::new(),
            }));
        }

        Ok(ParsedType::Standard(StandardType::new(
            self.span.display(semantic),
        )))
    }
}

impl TypeParser for TSTupleType<'_> {
    /// Parses tuple members with their labels and optional or rest markers.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        let elements = self
            .element_types
            .iter()
            .map(|element| {
                parse_tuple_element(element, semantic, resolver, generic_bindings, registry)
            })
            .collect::<Result<Vec<TupleElement>>>()?;

        Ok(ParsedType::Tuple(elements))
    }
}

impl TypeParser for TSTypeOperator<'_> {
    /// Parses a type operator and its operand.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        let kind = match self.operator {
            TSTypeOperatorOperator::Keyof => TypeOperatorKind::Keyof,
            TSTypeOperatorOperator::Unique => TypeOperatorKind::Unique,
            TSTypeOperatorOperator::Readonly => TypeOperatorKind::Readonly,
        };

        Ok(ParsedType::TypeOperator {
            kind,
            type_annotation: Box::new(self.type_annotation.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
        })
    }
}

impl TypeParser for TSIndexedAccessType<'_> {
    /// Parses the object and index of an indexed access type.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        Ok(ParsedType::IndexedAccess {
            object: Box::new(self.object_type.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
            index: Box::new(self.index_type.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
        })
    }
}

impl TypeParser for TSConditionalType<'_> {
    /// Parses the condition and both branches of a conditional type.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        Ok(ParsedType::Conditional {
            check: Box::new(self.check_type.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
            extends: Box::new(self.extends_type.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
            true_type: Box::new(self.true_type.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
            false_type: Box::new(self.false_type.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?),
        })
    }
}

impl TypeParser for TSTypeReference<'_> {
    /// Resolves named types, generic arguments, utilities, and snippets.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        let TSTypeName::IdentifierReference(ident) = &self.type_name else {
            return Err(format!("Unsupported type name: {:?}", self.type_name).into());
        };

        if let Some(parsed) = generic_bindings.get(&ident.name) {
            if self.type_arguments.is_some() {
                return Err(format!(
                    "Generic parameter {} cannot receive type arguments",
                    ident.name
                )
                .into());
            }

            return Ok(parsed.clone());
        }

        // This allows to check for utility types.
        if let Ok(utility_kind) = UtilityTKind::from_str(&ident.name) {
            return ident.parse_utility_type(
                UtilityType::T(utility_kind),
                self,
                semantic,
                resolver,
                generic_bindings,
                registry,
            );
        } else if let Ok(utility_kind) = UtilityKVKind::from_str(&ident.name) {
            return ident.parse_utility_type(
                UtilityType::KV(utility_kind),
                self,
                semantic,
                resolver,
                generic_bindings,
                registry,
            );
        };

        // Snippets need their structural representation before the generic external-type mapping
        // so bare `Snippet` properties are emitted in the snippets documentation section.
        if ident.name == "Snippet" {
            let mut snippet_args = None;

            if let Some(args) = &self.type_arguments {
                let Some(TSType::TSTupleType(inner)) = args.params.first() else {
                    return Err(format!(
                        "Invalid snippet type parameter: {:?}",
                        args.params.first()
                    )
                    .into());
                };

                let Some(TSTupleElement::TSTypeLiteral(literal)) = inner.element_types.first()
                else {
                    return Err(format!(
                        "Expected a type literal for snippet type arguments but got: {:?}",
                        inner.element_types.first()
                    )
                    .into());
                };

                let parsed: HashMap<String, ParsedType> = literal
                    .parse_body(semantic, resolver, generic_bindings, registry)?
                    .into_iter()
                    .map(|prop| (prop.key.to_ts(), prop.type_annotation))
                    .collect();

                snippet_args = Some(parsed);
            }

            return Ok(ParsedType::Snippet(snippet_args.unwrap_or_default()));
        }

        // This allows to check for external types like `HTMLAttributes<...>`.
        let whole_name = self.span.display(semantic);
        if let Some(external) = ExternalType::maybe_new(whole_name) {
            return Ok(ParsedType::External(external));
        }

        let type_args = self
            .type_arguments
            .as_ref()
            .map(|args| {
                args.params
                    .iter()
                    .map(|arg| arg.parse_type(semantic, resolver, generic_bindings, registry))
                    .collect::<Result<Vec<ParsedType>>>()
            })
            .transpose()?
            .unwrap_or_default();

        let mut reference_type = None;

        ident.resolve(semantic, resolver, &mut |resolved, scope_resolver| {
            let mut parsed_reference = ReferenceType {
                name: ident.name.to_string(),
                type_args: type_args.clone(),
                parsed: Box::new(ParsedType::Standard(StandardType::new(
                    ident.name.to_string(),
                ))),
            };
            let lookup_name = parsed_reference.to_ts();

            match resolved {
                ResolvedReference::VariableDeclarator(..) => {
                    return Err(format!(
                        "Type declarations must be types, not variables. Parsing: {:?}",
                        resolved
                    )
                    .into());
                }
                ResolvedReference::TSTypeAliasDeclaration(decl, semantic) => {
                    if decl.type_parameters.is_none() && !type_args.is_empty() {
                        return Err(format!(
                            "Type alias {} does not accept type arguments",
                            decl.id.name
                        )
                        .into());
                    }

                    let definition_id = registry.definition_id(
                        scope_resolver.0,
                        decl.span.start,
                        DefinitionKind::TypeAlias,
                    );
                    let additional_dependencies = registry.dependencies_for_types(&type_args);
                    registry.register_reference_with_dependencies(
                        &lookup_name,
                        ident.name.as_str(),
                        definition_id.clone(),
                        additional_dependencies,
                    )?;

                    let is_resolving = registry.is_resolving(&definition_id);
                    registry.ensure_definition(
                        definition_id.clone(),
                        |registry| -> Result<TypeDefinition> {
                            let generics = decl
                                .type_parameters
                                .as_ref()
                                .map(|params| params.extract(semantic, scope_resolver, registry))
                                .transpose()?
                                .unwrap_or_default();
                            let declaration_bindings = decl
                                .type_parameters
                                .as_ref()
                                .map(|params| params.declaration_bindings())
                                .unwrap_or_default();
                            let value = decl.type_annotation.parse_type(
                                semantic,
                                scope_resolver,
                                &declaration_bindings,
                                registry,
                            )?;

                            Ok(TypeDefinition::TypeAlias {
                                name: decl.id.name.to_string(),
                                generics,
                                value,
                            })
                        },
                    )?;

                    if is_resolving {
                        reference_type = Some(parsed_reference);
                        return Ok(());
                    }

                    let callee_bindings = decl
                        .type_parameters
                        .as_ref()
                        .map(|params| {
                            params.instantiate_bindings(
                                &type_args,
                                semantic,
                                scope_resolver,
                                registry,
                            )
                        })
                        .transpose()?
                        .unwrap_or_else(GenericBindings::default);

                    if let Some(parsed) = registry.expand_reference(definition_id, |registry| {
                        decl.type_annotation.parse_type(
                            semantic,
                            scope_resolver,
                            &callee_bindings,
                            registry,
                        )
                    })? {
                        parsed_reference.parsed = Box::new(parsed);
                    }

                    reference_type = Some(parsed_reference);
                }
                ResolvedReference::TSInterfaceDeclaration(decl, semantic) => {
                    if decl.type_parameters.is_none() && !type_args.is_empty() {
                        return Err(format!(
                            "Interface {} does not accept type arguments",
                            decl.id.name
                        )
                        .into());
                    }

                    let definition_id = registry.definition_id(
                        scope_resolver.0,
                        decl.span.start,
                        DefinitionKind::Interface,
                    );
                    let additional_dependencies = registry.dependencies_for_types(&type_args);
                    registry.register_reference_with_dependencies(
                        &lookup_name,
                        ident.name.as_str(),
                        definition_id.clone(),
                        additional_dependencies,
                    )?;

                    let is_resolving = registry.is_resolving(&definition_id);
                    registry.ensure_definition(
                        definition_id.clone(),
                        |registry| -> Result<TypeDefinition> {
                            let declaration_bindings = decl
                                .type_parameters
                                .as_ref()
                                .map(|params| params.declaration_bindings())
                                .unwrap_or_default();
                            let interface = decl.parse(
                                semantic,
                                scope_resolver,
                                &declaration_bindings,
                                registry,
                            )?;

                            Ok(TypeDefinition::Interface(interface))
                        },
                    )?;

                    if is_resolving {
                        reference_type = Some(parsed_reference);
                        return Ok(());
                    }

                    let callee_bindings = decl
                        .type_parameters
                        .as_ref()
                        .map(|params| {
                            params.instantiate_bindings(
                                &type_args,
                                semantic,
                                scope_resolver,
                                registry,
                            )
                        })
                        .transpose()?
                        .unwrap_or_else(GenericBindings::default);

                    if let Some(parsed) = registry.expand_reference(definition_id, |registry| {
                        decl.parse(semantic, scope_resolver, &callee_bindings, registry)
                            .map(ParsedType::Interface)
                    })? {
                        parsed_reference.parsed = Box::new(parsed);
                    }

                    reference_type = Some(parsed_reference);
                }
            }

            Ok(())
        })?;

        let parsed_type = if let Some(ref_type) = reference_type {
            ParsedType::Reference(ref_type)
        } else {
            let name = if type_args.is_empty() {
                ident.to_string()
            } else {
                format!(
                    "{}<{}>",
                    ident,
                    type_args
                        .iter()
                        .map(ToTs::to_ts)
                        .collect::<Vec<_>>()
                        .join(", ")
                )
            };

            ParsedType::Standard(StandardType::new(name))
        };

        Ok(parsed_type)
    }
}

impl TypeParser for TSTypeQuery<'_> {
    /// Records value dependencies referenced by a `typeof` query.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        _generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        if let TSTypeQueryExprName::IdentifierReference(ident) = &self.expr_name {
            ident.resolve(semantic, resolver, &mut |resolved, scope_resolver| {
                let ResolvedReference::VariableDeclarator(declaration, semantic) = resolved else {
                    return Ok(());
                };
                let BindingPattern::BindingIdentifier(binding) = &declaration.id else {
                    return Ok(());
                };
                let kind = semantic
                    .nodes()
                    .ancestors(declaration.node_id.get())
                    .find_map(|node| {
                        if let AstKind::VariableDeclaration(declaration) = node.kind() {
                            Some(declaration.kind.as_str())
                        } else {
                            None
                        }
                    })
                    .ok_or("Expected a variable declaration for typeof dependency")?;
                let definition_id = registry.definition_id(
                    scope_resolver.0,
                    declaration.span.start,
                    DefinitionKind::Variable,
                );

                registry.ensure_definition(
                    definition_id.clone(),
                    |_| -> Result<TypeDefinition> {
                        Ok(TypeDefinition::Variable {
                            name: binding.name.to_string(),
                            kind: kind.to_string(),
                            declarator: declaration.span.display(semantic),
                        })
                    },
                )?;
                registry.register_reference_with_dependencies(
                    ident.name.to_string(),
                    ident.name.to_string(),
                    definition_id,
                    std::iter::empty(),
                )?;

                Ok(())
            })?;
        }

        Ok(ParsedType::Standard(StandardType::new(
            self.span.display(semantic),
        )))
    }
}

impl TypeParser for TSMappedType<'_> {
    /// Records mapped-type dependencies while preserving its source spelling.
    fn parse_type(
        &self,
        semantic: &Semantic,
        resolver: &PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        self.constraint
            .parse_type(semantic, resolver, generic_bindings, registry)?;
        let bindings = generic_bindings.with_shadowed_generics(&[GenericInfo {
            name: self.key.name.to_string(),
            constraint: None,
            default: None,
        }]);

        for annotation in [&self.name_type, &self.type_annotation]
            .into_iter()
            .flatten()
        {
            annotation.parse_type(semantic, resolver, &bindings, registry)?;
        }

        Ok(ParsedType::Standard(StandardType::new(
            self.span.display(semantic),
        )))
    }
}

impl TypeParser for TSType<'_> {
    /// Dispatches supported AST types and preserves source text for other forms.
    fn parse_type(
        &self,
        semantic: &oxc_semantic::Semantic,
        resolver: &crate::resolver::PathResolver,
        generic_bindings: &GenericBindings,
        registry: &mut TypeRegistry,
    ) -> Result<ParsedType> {
        match self {
            Self::TSParenthesizedType(union) => {
                union.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSUnionType(union) => {
                union.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSIntersectionType(intersection) => {
                intersection.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSFunctionType(func) => {
                func.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSTypeLiteral(literal) => literal
                .parse_body(semantic, resolver, generic_bindings, registry)
                .map(ParsedType::TypeLiteral),
            Self::TSArrayType(arr) => {
                arr.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSTypeReference(reference) => {
                reference.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSTemplateLiteralType(template) => {
                template.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSLiteralType(literal) => {
                literal.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSTupleType(tuple) => {
                tuple.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSTypeOperatorType(operator) => {
                operator.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSIndexedAccessType(indexed) => {
                indexed.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSConditionalType(conditional) => {
                conditional.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSTypeQuery(query) => {
                query.parse_type(semantic, resolver, generic_bindings, registry)
            }
            Self::TSMappedType(mapped) => {
                mapped.parse_type(semantic, resolver, generic_bindings, registry)
            }
            _ => {
                let def = self.span().display(semantic);
                Ok(ParsedType::Standard(StandardType::new(def)))
            }
        }
    }
}
