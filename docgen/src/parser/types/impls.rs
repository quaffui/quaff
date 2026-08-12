use std::{collections::HashMap, str::FromStr};

use oxc::{
    ast::ast::{
        TSArrayType, TSConditionalType, TSIndexedAccessType, TSIntersectionType, TSLiteral,
        TSLiteralType, TSParenthesizedType, TSTemplateLiteralType, TSTupleElement, TSTupleType,
        TSType, TSTypeName, TSTypeOperator, TSTypeOperatorOperator, TSTypeReference, TSUnionType,
    },
    span::GetSpan,
};
use oxc_semantic::Semantic;

use crate::{
    Result, SpanDisplay,
    extractor::{
        Extractor,
        generics::{GenericBindings, GenericBindingsParser},
    },
    parser::types::interfaces::InterfacePropertyKey,
    resolver::{
        PathResolver, ReferenceResolver, ResolvedReference,
        dependency::{DefinitionKind, TypeDefinition, TypeRegistry},
    },
    transformer::mapping::TYPE_SRC_MAPPINGS,
    transformer::typescript::ToTs,
};

use super::{
    ExternalType, ParsedType, ReferenceType, StandardType, TemplateLiteralSpan,
    TemplateLiteralType, TupleElement, TypeOperatorKind, TypeParser, UtilityTypeParser,
    interfaces::InterfaceParser,
    ts_utilities::{UtilityKVKind, UtilityTKind, UtilityType},
};

impl StandardType {
    pub fn new(name: String) -> Self {
        Self { name }
    }
}

impl ExternalType {
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

impl IntoIterator for ParsedType {
    type Item = Self;

    type IntoIter = std::vec::IntoIter<Self>;

    fn into_iter(self) -> Self::IntoIter {
        match self {
            Self::Union(types) | Self::Intersection(types) => types.into_iter(),
            _ => panic!("Called into_iter() on a non-union/non-intersection ParsedType"),
        }
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

fn parse_tuple_element(
    element: &TSTupleElement<'_>,
    semantic: &Semantic,
    resolver: &PathResolver,
    generic_bindings: &GenericBindings,
    registry: &mut TypeRegistry,
) -> Result<TupleElement> {
    match element {
        TSTupleElement::TSOptionalType(optional) => Ok(TupleElement {
            label: None,
            type_annotation: optional.type_annotation.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?,
            optional: true,
            rest: false,
        }),
        TSTupleElement::TSRestType(rest) => Ok(TupleElement {
            label: None,
            type_annotation: rest.type_annotation.parse_type(
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?,
            optional: false,
            rest: true,
        }),
        TSTupleElement::TSNamedTupleMember(named) => {
            let mut parsed = parse_tuple_element(
                &named.element_type,
                semantic,
                resolver,
                generic_bindings,
                registry,
            )?;
            parsed.label = Some(named.label.name.to_string());
            parsed.optional |= named.optional;
            Ok(parsed)
        }
        _ => {
            let Some(ts_type) = element.as_ts_type() else {
                return Err(format!("Unsupported tuple element: {element:?}").into());
            };

            Ok(TupleElement {
                label: None,
                type_annotation: ts_type.parse_type(
                    semantic,
                    resolver,
                    generic_bindings,
                    registry,
                )?,
                optional: false,
                rest: false,
            })
        }
    }
}

impl TypeParser for TSTypeOperator<'_> {
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
                    .map(|prop| {
                        let name = match prop.key {
                            InterfacePropertyKey::Identifier(name) => name,
                            InterfacePropertyKey::IndexSignature {
                                name,
                                type_annotation,
                            } => {
                                let ParsedType::Standard(StandardType { name: index_type }) =
                                    type_annotation
                                else {
                                    panic!("Invalid index type: {:?}", type_annotation)
                                };

                                format!("[{}: {}]", name, index_type)
                            }
                        };

                        (name, prop.type_annotation)
                    })
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

                    let resolving = registry.is_resolving(&definition_id);
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

                    if resolving {
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
                    let expansion_key = format!("{definition_id:?}:{lookup_name}");

                    if let Some(parsed) = registry.expand_reference(expansion_key, |registry| {
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

                    let resolving = registry.is_resolving(&definition_id);
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

                    if resolving {
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
                    let expansion_key = format!("{definition_id:?}:{lookup_name}");

                    if let Some(parsed) = registry.expand_reference(expansion_key, |registry| {
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

impl TypeParser for TSType<'_> {
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
            _ => {
                let def = self.span().display(semantic);
                Ok(ParsedType::Standard(StandardType::new(def)))
            }
        }
    }
}
