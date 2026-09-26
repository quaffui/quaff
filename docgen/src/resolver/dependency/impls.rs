use std::{
    collections::{BTreeMap, BTreeSet},
    fmt::{Debug, Formatter},
    path::{Path, PathBuf},
};

use crate::{
    parser::{Interface, InterfaceProperty, InterfacePropertyKey, ParsedType},
    transformer::{ToTs, ToTsDefinition},
};

use super::{
    DefinitionId, DefinitionKind, DefinitionNode, DependencyError, ReferenceUse, ResolutionState,
    TypeDefinition, TypeDefinitions, TypeRegistry,
};

impl DefinitionId {
    /// Creates a declaration identity with normalized source path separators.
    pub fn new(source: impl Into<String>, span_start: u32, kind: DefinitionKind) -> Self {
        Self {
            source: source.into().replace('\\', "/"),
            span_start,
            kind,
        }
    }

    /// Builds a reproducible declaration identity from a source path.
    pub fn from_path(root: &Path, source: &Path, span_start: u32, kind: DefinitionKind) -> Self {
        let relative = source.strip_prefix(root).unwrap_or(source);

        Self::new(relative.to_string_lossy(), span_start, kind)
    }
}

impl TypeDefinition {
    /// Returns the original declaration name used when rendering dependencies.
    pub fn name(&self) -> &str {
        match self {
            Self::TypeAlias { name, .. } | Self::Variable { name, .. } => name,
            Self::Interface(interface) => &interface.name,
        }
    }
}

impl TypeRegistry {
    /// Creates a registry whose declaration identities are relative to the input root.
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self {
            root: Some(root.into()),
            ..Self::default()
        }
    }

    /// Creates an ID relative to this registry's input root.
    pub fn definition_id(
        &self,
        source: &Path,
        span_start: u32,
        kind: DefinitionKind,
    ) -> DefinitionId {
        self.root
            .as_deref()
            .map(|root| DefinitionId::from_path(root, source, span_start, kind))
            .unwrap_or_else(|| DefinitionId::new(source.to_string_lossy(), span_start, kind))
    }

    /// Parses and stores a declaration once.
    ///
    /// Returns `Ok(false)` when the declaration is already resolved or is currently being resolved.
    /// The latter is the back-edge that terminates recursive and mutually recursive types.
    pub fn ensure_definition<E, F>(
        &mut self,
        id: DefinitionId,
        build: F,
    ) -> std::result::Result<bool, E>
    where
        E: From<DependencyError>,
        F: FnOnce(&mut Self) -> std::result::Result<TypeDefinition, E>,
    {
        if self.states.contains_key(&id) {
            return Ok(false);
        }

        self.states.insert(id.clone(), ResolutionState::Resolving);
        self.pending_dependencies.entry(id.clone()).or_default();
        self.owner_stack.push(id.clone());

        let result = build(self);
        let found = self.owner_stack.pop();

        if found.as_ref() != Some(&id) {
            self.states.remove(&id);
            self.pending_dependencies.remove(&id);

            return Err(DependencyError::ResolutionStackCorrupted {
                expected: id,
                found,
            }
            .into());
        }

        match result {
            Ok(definition) => {
                let dependencies = self.pending_dependencies.remove(&id).unwrap_or_default();

                self.nodes.insert(
                    id.clone(),
                    DefinitionNode {
                        definition,
                        dependencies,
                    },
                );
                self.states.insert(id, ResolutionState::Resolved);

                Ok(true)
            }
            Err(error) => {
                self.states.remove(&id);
                self.pending_dependencies.remove(&id);
                Err(error)
            }
        }
    }

    /// Registers a reference and an edge from the declaration currently being parsed.
    #[cfg(test)]
    pub fn register_reference(
        &mut self,
        lookup_name: impl Into<String>,
        declaration_name: impl Into<String>,
        target: DefinitionId,
    ) -> Result<(), DependencyError> {
        self.register_reference_with_dependencies(
            lookup_name,
            declaration_name,
            target,
            std::iter::empty(),
        )
    }

    /// Registers a generic or otherwise specialized reference.
    ///
    /// `additional_dependencies` contains declarations used by the specialization itself. For
    /// example, `Box<QSize>` targets the generic `Box` declaration and additionally depends on
    /// `QSize`.
    pub fn register_reference_with_dependencies<I>(
        &mut self,
        lookup_name: impl Into<String>,
        declaration_name: impl Into<String>,
        target: DefinitionId,
        additional_dependencies: I,
    ) -> Result<(), DependencyError>
    where
        I: IntoIterator<Item = DefinitionId>,
    {
        let lookup_name = lookup_name.into();
        let declaration_name = declaration_name.into();
        let additional_dependencies = additional_dependencies.into_iter().collect::<BTreeSet<_>>();

        if let Some(existing) = self.uses.get_mut(&lookup_name) {
            if existing.target != target || existing.declaration_name != declaration_name {
                return Err(DependencyError::AmbiguousReference {
                    lookup_name,
                    first: existing.target.clone(),
                    second: target,
                });
            }

            existing
                .additional_dependencies
                .extend(additional_dependencies.iter().cloned());
        } else {
            self.uses.insert(
                lookup_name,
                ReferenceUse {
                    target: target.clone(),
                    declaration_name,
                    additional_dependencies: additional_dependencies.clone(),
                },
            );
        }

        if let Some(owner) = self.owner_stack.last().cloned() {
            let dependencies = self.pending_dependencies.entry(owner.clone()).or_default();

            if target != owner {
                dependencies.insert(target);
            }

            dependencies.extend(
                additional_dependencies
                    .into_iter()
                    .filter(|dependency| dependency != &owner),
            );
        }

        Ok(())
    }

    /// Expands each declaration once along the active reference path, even if type arguments change.
    ///
    /// `Ok(None)` is returned for a recursive back-edge. Callers should retain a shallow
    /// [`ParsedType`] reference in that case.
    pub fn expand_reference<T, E, F>(
        &mut self,
        key: DefinitionId,
        expand: F,
    ) -> std::result::Result<Option<T>, E>
    where
        F: FnOnce(&mut Self) -> std::result::Result<T, E>,
    {
        if !self.active_expansions.insert(key.clone()) {
            return Ok(None);
        }

        let result = expand(self);
        self.active_expansions.remove(&key);

        result.map(Some)
    }

    /// Reports whether a declaration is currently being parsed.
    pub fn is_resolving(&self, id: &DefinitionId) -> bool {
        self.states.get(id) == Some(&ResolutionState::Resolving)
    }

    /// Returns the declaration associated with a displayed reference name.
    pub fn target_for_lookup(&self, lookup_name: &str) -> Option<DefinitionId> {
        self.uses
            .get(lookup_name)
            .map(|reference| reference.target.clone())
    }

    /// Finds declaration IDs directly referenced by parsed type arguments or inline types.
    pub fn dependencies_for_types(&self, types: &[ParsedType]) -> BTreeSet<DefinitionId> {
        let mut dependencies = BTreeSet::new();

        for parsed in types {
            self.collect_type_dependencies(parsed, &mut dependencies);
        }

        dependencies
    }

    /// Generates the complete, deterministic lookup consumed by documentation tooltips.
    pub fn build_type_definitions(&self) -> Result<TypeDefinitions, DependencyError> {
        self.uses
            .iter()
            .map(|(lookup_name, reference)| {
                let ordered = self.ordered_definitions(reference)?;
                let definitions = ordered
                    .into_iter()
                    .map(|id| {
                        let node = self.nodes.get(id).ok_or_else(|| {
                            DependencyError::MissingDefinition {
                                definition: id.clone(),
                            }
                        })?;

                        let names = self
                            .uses
                            .values()
                            .filter(|usage| usage.target == *id)
                            .map(|usage| usage.declaration_name.as_str())
                            .collect::<BTreeSet<_>>();

                        if names.is_empty() {
                            return Ok(node.definition.to_ts_definition());
                        }

                        Ok(names
                            .into_iter()
                            .map(|name| node.definition.to_ts_definition_as(name))
                            .collect::<Vec<_>>()
                            .join("\n"))
                    })
                    .collect::<Result<Vec<_>, DependencyError>>()?;

                let definitions = if definitions.len() <= 1 {
                    definitions.join("")
                } else {
                    let (deps, target) = definitions.split_at(definitions.len() - 1);
                    format!("{}\n\n{}", deps.join("\n"), target[0])
                };

                Ok((lookup_name.clone(), definitions))
            })
            .collect()
    }

    /// Records dependencies for all property types directly onto the current owner declaration.
    pub fn record_properties_dependencies_for_current_owner(
        &mut self,
        properties: &[InterfaceProperty],
    ) {
        if let Some(owner) = self.owner_stack.last().cloned() {
            let mut dependencies = BTreeSet::new();

            for property in properties {
                if let InterfacePropertyKey::IndexSignature {
                    type_annotation, ..
                } = &property.key
                {
                    self.collect_type_dependencies(type_annotation, &mut dependencies);
                }

                self.collect_type_dependencies(&property.type_annotation, &mut dependencies);
            }

            let owner_dependencies = self.pending_dependencies.entry(owner.clone()).or_default();
            owner_dependencies.extend(dependencies.into_iter().filter(|dep| dep != &owner));
        }
    }

    /// Records dependencies for all property types of the given interface directly onto the current owner declaration.
    pub fn record_interface_dependencies_for_current_owner(&mut self, interface: &Interface) {
        self.record_properties_dependencies_for_current_owner(&interface.properties);
    }

    #[cfg(test)]
    /// Counts declarations that have finished parsing.
    pub fn definition_count(&self) -> usize {
        self.nodes.len()
    }

    /// Orders transitive dependencies before the hovered declaration.
    fn ordered_definitions<'a>(
        &'a self,
        reference: &'a ReferenceUse,
    ) -> Result<Vec<&'a DefinitionId>, DependencyError> {
        if !self.nodes.contains_key(&reference.target) {
            return Err(DependencyError::MissingDefinition {
                definition: reference.target.clone(),
            });
        }

        let mut states = BTreeMap::new();
        let mut ordered = Vec::new();

        // Keep the hovered target open while traversing every dependency. Any edge back to it is a
        // cycle and is skipped, after which the target is deliberately emitted last.
        states.insert(reference.target.clone(), ResolutionState::Resolving);

        for dependency in &reference.additional_dependencies {
            self.visit(dependency, &mut states, &mut ordered)?;
        }

        let node = self.nodes.get(&reference.target).ok_or_else(|| {
            DependencyError::MissingDefinition {
                definition: reference.target.clone(),
            }
        })?;

        for dependency in &node.dependencies {
            self.visit(dependency, &mut states, &mut ordered)?;
        }

        states.insert(reference.target.clone(), ResolutionState::Resolved);
        ordered.push(&reference.target);

        Ok(ordered)
    }

    /// Visits each declaration once while tolerating dependency cycles.
    fn visit<'a>(
        &'a self,
        id: &'a DefinitionId,
        states: &mut BTreeMap<DefinitionId, ResolutionState>,
        ordered: &mut Vec<&'a DefinitionId>,
    ) -> Result<(), DependencyError> {
        if states.contains_key(id) {
            return Ok(());
        }

        let node = self
            .nodes
            .get(id)
            .ok_or_else(|| DependencyError::MissingDefinition {
                definition: id.clone(),
            })?;

        states.insert(id.clone(), ResolutionState::Resolving);

        for dependency in &node.dependencies {
            self.visit(dependency, states, ordered)?;
        }

        states.insert(id.clone(), ResolutionState::Resolved);
        ordered.push(id);

        Ok(())
    }

    /// Walks a parsed type to collect the declarations referenced by its nested types.
    fn collect_type_dependencies(
        &self,
        parsed: &ParsedType,
        dependencies: &mut BTreeSet<DefinitionId>,
    ) {
        match parsed {
            ParsedType::Reference(reference) => {
                if let Some(target) = self.target_for_lookup(&reference.to_ts()) {
                    dependencies.insert(target);
                }

                for type_arg in &reference.type_args {
                    self.collect_type_dependencies(type_arg, dependencies);
                }
            }
            ParsedType::TemplateLiteral(template) => {
                for span in &template.spans {
                    self.collect_type_dependencies(&span.type_annotation, dependencies);
                }
            }
            ParsedType::Snippet(params) => {
                for parsed in params.values() {
                    self.collect_type_dependencies(parsed, dependencies);
                }
            }
            ParsedType::UtilityT { t, .. } => {
                self.collect_type_dependencies(t, dependencies);
            }
            ParsedType::UtilityKV { k, v, .. } => {
                self.collect_type_dependencies(k, dependencies);
                self.collect_type_dependencies(v, dependencies);
            }
            ParsedType::Interface(interface) => {
                for generic in &interface.generics {
                    if let Some(constraint) = &generic.constraint {
                        self.collect_type_dependencies(constraint, dependencies);
                    }

                    if let Some(default) = &generic.default {
                        self.collect_type_dependencies(default, dependencies);
                    }
                }

                for property in &interface.properties {
                    if let InterfacePropertyKey::IndexSignature {
                        type_annotation, ..
                    } = &property.key
                    {
                        self.collect_type_dependencies(type_annotation, dependencies);
                    }

                    self.collect_type_dependencies(&property.type_annotation, dependencies);
                }

                if let Some(heritage) = &interface.dom_props_heritage {
                    self.collect_type_dependencies(heritage, dependencies);
                }
            }
            ParsedType::TypeLiteral(properties) => {
                for property in properties {
                    if let InterfacePropertyKey::IndexSignature {
                        type_annotation, ..
                    } = &property.key
                    {
                        self.collect_type_dependencies(type_annotation, dependencies);
                    }

                    self.collect_type_dependencies(&property.type_annotation, dependencies);
                }
            }
            ParsedType::Function(function) => {
                for generic in &function.generics {
                    if let Some(constraint) = &generic.constraint {
                        self.collect_type_dependencies(constraint, dependencies);
                    }

                    if let Some(default) = &generic.default {
                        self.collect_type_dependencies(default, dependencies);
                    }
                }

                for param in &function.params {
                    self.collect_type_dependencies(&param.type_annotation, dependencies);
                }

                self.collect_type_dependencies(&function.return_type, dependencies);
            }
            ParsedType::Tuple(elements) => {
                for element in elements {
                    self.collect_type_dependencies(&element.type_annotation, dependencies);
                }
            }
            ParsedType::TypeOperator {
                type_annotation, ..
            } => self.collect_type_dependencies(type_annotation, dependencies),
            ParsedType::IndexedAccess { object, index } => {
                self.collect_type_dependencies(object, dependencies);
                self.collect_type_dependencies(index, dependencies);
            }
            ParsedType::Conditional {
                check,
                extends,
                true_type,
                false_type,
            } => {
                self.collect_type_dependencies(check, dependencies);
                self.collect_type_dependencies(extends, dependencies);
                self.collect_type_dependencies(true_type, dependencies);
                self.collect_type_dependencies(false_type, dependencies);
            }
            ParsedType::Union(types) | ParsedType::Intersection(types) => {
                for parsed in types {
                    self.collect_type_dependencies(parsed, dependencies);
                }
            }
            ParsedType::External(_) | ParsedType::Standard(_) => {}
        }
    }
}

impl Debug for DependencyError {
    /// Keeps diagnostic formatting stable when errors cross the host boundary.
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AmbiguousReference {
                lookup_name,
                first,
                second,
            } => formatter
                .debug_struct("AmbiguousReference")
                .field("lookup_name", lookup_name)
                .field("first", first)
                .field("second", second)
                .finish(),
            Self::MissingDefinition { definition } => formatter
                .debug_tuple("MissingDefinition")
                .field(definition)
                .finish(),
            Self::ResolutionStackCorrupted { expected, found } => formatter
                .debug_struct("ResolutionStackCorrupted")
                .field("expected", expected)
                .field("found", found)
                .finish(),
        }
    }
}
