use std::{
    collections::{BTreeMap, BTreeSet},
    error::Error,
    fmt::{Display, Formatter},
    path::{Path, PathBuf},
};

use crate::{
    parser::types::{
        ParsedType,
        interfaces::{Interface, InterfaceProperty, InterfacePropertyKey},
    },
    transformer::typescript::{ToTs, ToTsDefinition},
};

use super::{
    DefinitionId, DefinitionKind, DefinitionNode, DependencyError, ReferenceUse, ResolutionState,
    TypeDefinition, TypeDefinitions, TypeRegistry,
};

impl DefinitionId {
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
    pub fn name(&self) -> &str {
        match self {
            Self::TypeAlias { name, .. } => name,
            Self::Interface(interface) => &interface.name,
        }
    }
}

impl Display for DependencyError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AmbiguousReference {
                lookup_name,
                first,
                second,
            } => write!(
                formatter,
                "The lookup name {lookup_name:?} resolves to both {first:?} and {second:?}"
            ),
            Self::MissingDefinition(id) => {
                write!(
                    formatter,
                    "No parsed TypeScript definition exists for {id:?}"
                )
            }
            Self::ResolutionStackCorrupted { expected, found } => write!(
                formatter,
                "Definition resolution stack was corrupted: expected {expected:?}, found {found:?}"
            ),
        }
    }
}

impl Error for DependencyError {}

impl TypeRegistry {
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

    /// Expands a reference once per active generic instantiation.
    ///
    /// `Ok(None)` is returned for a recursive back-edge. Callers should retain a shallow
    /// [`ParsedType`](crate::parser::types::ParsedType) reference in that case.
    pub fn expand_reference<T, E, F>(
        &mut self,
        key: impl Into<String>,
        expand: F,
    ) -> std::result::Result<Option<T>, E>
    where
        F: FnOnce(&mut Self) -> std::result::Result<T, E>,
    {
        let key = key.into();

        if !self.active_expansions.insert(key.clone()) {
            return Ok(None);
        }

        let result = expand(self);
        self.active_expansions.remove(&key);

        result.map(Some)
    }

    pub fn is_resolving(&self, id: &DefinitionId) -> bool {
        self.states.get(id) == Some(&ResolutionState::Resolving)
    }

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
                let last_index = ordered.len().saturating_sub(1);
                let definitions = ordered
                    .into_iter()
                    .enumerate()
                    .map(|(index, id)| {
                        let node = self
                            .nodes
                            .get(id)
                            .ok_or_else(|| DependencyError::MissingDefinition(id.clone()))?;

                        Ok(if index == last_index {
                            node.definition
                                .to_ts_definition_as(&reference.declaration_name)
                        } else {
                            node.definition.to_ts_definition()
                        })
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
    pub fn definition_count(&self) -> usize {
        self.nodes.len()
    }

    fn ordered_definitions<'a>(
        &'a self,
        reference: &'a ReferenceUse,
    ) -> Result<Vec<&'a DefinitionId>, DependencyError> {
        if !self.nodes.contains_key(&reference.target) {
            return Err(DependencyError::MissingDefinition(reference.target.clone()));
        }

        let mut states = BTreeMap::new();
        let mut ordered = Vec::new();

        // Keep the hovered target open while traversing every dependency. Any edge back to it is a
        // cycle and is skipped, after which the target is deliberately emitted last.
        states.insert(reference.target.clone(), ResolutionState::Resolving);

        for dependency in &reference.additional_dependencies {
            self.visit(dependency, &mut states, &mut ordered)?;
        }

        let node = self
            .nodes
            .get(&reference.target)
            .ok_or_else(|| DependencyError::MissingDefinition(reference.target.clone()))?;

        for dependency in &node.dependencies {
            self.visit(dependency, &mut states, &mut ordered)?;
        }

        states.insert(reference.target.clone(), ResolutionState::Resolved);
        ordered.push(&reference.target);

        Ok(ordered)
    }

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
            .ok_or_else(|| DependencyError::MissingDefinition(id.clone()))?;

        states.insert(id.clone(), ResolutionState::Resolving);

        for dependency in &node.dependencies {
            self.visit(dependency, states, ordered)?;
        }

        states.insert(id.clone(), ResolutionState::Resolved);
        ordered.push(id);

        Ok(())
    }

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

#[cfg(test)]
mod tests {
    use crate::{
        extractor::generics::GenericInfo,
        parser::types::{ParsedType, StandardType},
    };

    use super::*;

    fn id(name: &str) -> DefinitionId {
        DefinitionId::new(format!("types/{name}.ts"), 0, DefinitionKind::TypeAlias)
    }

    fn alias(name: &str, value: &str) -> TypeDefinition {
        TypeDefinition::TypeAlias {
            name: name.to_string(),
            generics: Vec::new(),
            value: ParsedType::Standard(StandardType::new(value.to_string())),
        }
    }

    #[test]
    fn orders_transitive_dependencies_before_the_target() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let a = id("A");
        let b = id("B");
        let c = id("C");

        registry.ensure_definition(c.clone(), |_| Ok(alias("C", "string")))?;
        registry.ensure_definition(b.clone(), |registry| {
            registry.register_reference("C", "C", c.clone())?;
            Ok(alias("B", "C"))
        })?;
        registry.ensure_definition(a.clone(), |registry| {
            registry.register_reference("B", "B", b.clone())?;
            Ok(alias("A", "B"))
        })?;
        registry.register_reference("A", "A", a)?;

        assert_eq!(
            registry.build_type_definitions()?["A"],
            "type C = string;\ntype B = C;\n\ntype A = B;"
        );

        Ok(())
    }

    #[test]
    fn deduplicates_diamond_dependencies() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let a = id("A");
        let b = id("B");
        let c = id("C");
        let d = id("D");

        registry.ensure_definition(d.clone(), |_| Ok(alias("D", "string")))?;

        for (current, name) in [(b.clone(), "B"), (c.clone(), "C")] {
            registry.ensure_definition(current, |registry| {
                registry.register_reference("D", "D", d.clone())?;
                Ok(alias(name, "D"))
            })?;
        }

        registry.ensure_definition(a.clone(), |registry| {
            registry.register_reference("B", "B", b)?;
            registry.register_reference("C", "C", c)?;
            Ok(alias("A", "B | C"))
        })?;
        registry.register_reference("A", "A", a)?;

        let definition = &registry.build_type_definitions()?["A"];
        assert_eq!(definition.matches("type D = string;").count(), 1);
        assert_eq!(
            definition,
            "type D = string;\ntype B = D;\ntype C = D;\n\ntype A = B | C;"
        );

        Ok(())
    }

    #[test]
    fn terminates_self_references() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let node = id("Node");

        registry.ensure_definition(node.clone(), |registry| {
            registry.register_reference("Node", "Node", node.clone())?;
            let parsed_again = registry.ensure_definition(node.clone(), |_| {
                panic!("a resolving declaration must not be parsed again")
            })?;
            assert!(!parsed_again);

            Ok(alias("Node", "{ next?: Node }"))
        })?;

        assert_eq!(
            registry.build_type_definitions()?["Node"],
            "type Node = { next?: Node };"
        );

        Ok(())
    }

    #[test]
    fn terminates_mutual_cycles_and_keeps_hovered_target_last() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let a = id("A");
        let b = id("B");

        registry.ensure_definition(a.clone(), |registry| {
            registry.register_reference("B", "B", b.clone())?;
            registry.ensure_definition(b.clone(), |registry| {
                registry.register_reference("A", "A", a.clone())?;
                assert!(!registry.ensure_definition(a.clone(), |_| {
                    panic!("a resolving declaration must not be parsed again")
                })?);

                Ok(alias("B", "{ a: A }"))
            })?;

            Ok(alias("A", "{ b: B }"))
        })?;

        let definitions = registry.build_type_definitions()?;
        assert_eq!(definitions["A"], "type B = { a: A };\n\ntype A = { b: B };");
        assert_eq!(definitions["B"], "type A = { b: B };\n\ntype B = { a: A };");

        Ok(())
    }

    #[test]
    fn renders_multiple_generic_uses_from_one_definition() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let boxed = id("Box");
        let size = id("QSize");

        registry.ensure_definition(boxed.clone(), |_| {
            Ok(TypeDefinition::TypeAlias {
                name: "Box".to_string(),
                generics: vec![GenericInfo {
                    name: "T".to_string(),
                    constraint: None,
                    default: None,
                }],
                value: ParsedType::Standard(StandardType::new("{ value: T }".to_string())),
            })
        })?;
        registry.ensure_definition(size.clone(), |_| Ok(alias("QSize", r#""sm" | "md""#)))?;

        registry.register_reference("Box<string>", "Box", boxed.clone())?;
        registry.register_reference_with_dependencies("Box<QSize>", "Box", boxed, [size])?;

        let definitions = registry.build_type_definitions()?;
        assert_eq!(definitions["Box<string>"], "type Box<T> = { value: T };");
        assert_eq!(
            definitions["Box<QSize>"],
            "type QSize = \"sm\" | \"md\";\n\ntype Box<T> = { value: T };"
        );
        assert_eq!(registry.definition_count(), 2);

        Ok(())
    }

    #[test]
    fn rejects_ambiguous_lookup_names() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let first = id("first/Foo");
        let second = id("second/Foo");

        registry.register_reference("Foo", "Foo", first.clone())?;
        let error = registry
            .register_reference("Foo", "Foo", second.clone())
            .unwrap_err();

        assert_eq!(
            error,
            DependencyError::AmbiguousReference {
                lookup_name: "Foo".to_string(),
                first,
                second,
            }
        );

        Ok(())
    }

    #[test]
    fn reports_missing_definitions() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();
        let missing = id("Missing");
        registry.register_reference("Missing", "Missing", missing.clone())?;

        assert_eq!(
            registry.build_type_definitions().unwrap_err(),
            DependencyError::MissingDefinition(missing)
        );

        Ok(())
    }

    #[test]
    fn terminates_recursive_generic_expansions() -> Result<(), DependencyError> {
        let mut registry = TypeRegistry::default();

        let expanded = registry.expand_reference("Node<string>", |registry| {
            assert!(
                registry
                    .expand_reference("Node<string>", |_| Ok::<_, DependencyError>(()))?
                    .is_none()
            );
            Ok::<_, DependencyError>("expanded")
        })?;

        assert_eq!(expanded, Some("expanded"));
        assert_eq!(
            registry.expand_reference("Node<string>", |_| Ok::<_, DependencyError>("again"))?,
            Some("again")
        );

        Ok(())
    }
}
