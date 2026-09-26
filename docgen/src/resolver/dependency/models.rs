use std::{
    collections::{BTreeMap, BTreeSet},
    path::PathBuf,
};

use snafu::Snafu;

use crate::{
    extractor::GenericInfo,
    parser::{Interface, ParsedType},
};

/// The kind of TypeScript declaration represented by a [`DefinitionId`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum DefinitionKind {
    TypeAlias,
    Interface,
    Variable,
}

/// Stable identity for a declaration within a docgen run.
///
/// The source should be relative to the docgen input root. Keeping the source and declaration
/// offset in the identity prevents same-named declarations in separate modules from colliding.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct DefinitionId {
    pub source: String,
    pub span_start: u32,
    pub kind: DefinitionKind,
}

/// A named TypeScript declaration that can be included in a hover definition.
#[derive(Debug, Clone)]
pub enum TypeDefinition {
    TypeAlias {
        name: String,
        generics: Vec<GenericInfo>,
        value: ParsedType,
    },
    Interface(Interface),
    Variable {
        name: String,
        kind: String,
        declarator: String,
    },
}

/// Final lookup emitted for documentation consumers.
///
/// Each value is self-contained TypeScript with transitive dependencies before the hovered target.
pub type TypeDefinitions = BTreeMap<String, String>;

/// Tracks declarations being parsed so recursive references can terminate.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(super) enum ResolutionState {
    Resolving,
    Resolved,
}

/// A parsed declaration and the definitions it depends on.
#[derive(Debug, Clone)]
pub(super) struct DefinitionNode {
    pub definition: TypeDefinition,
    pub dependencies: BTreeSet<DefinitionId>,
}

/// A displayed reference and the declaration and arguments needed for its hover text.
#[derive(Debug, Clone)]
pub(super) struct ReferenceUse {
    pub target: DefinitionId,
    pub declaration_name: String,
    pub additional_dependencies: BTreeSet<DefinitionId>,
}

/// Owns parsed declarations, graph edges, and the names used by hoverable references.
///
/// A registry is normally shared while parsing one props interface. Parsing declarations through
/// [`TypeRegistry::ensure_definition`] makes recursive references cycle-safe.
#[derive(Debug, Default)]
pub struct TypeRegistry {
    pub(super) root: Option<PathBuf>,
    pub(super) nodes: BTreeMap<DefinitionId, DefinitionNode>,
    pub(super) states: BTreeMap<DefinitionId, ResolutionState>,
    pub(super) pending_dependencies: BTreeMap<DefinitionId, BTreeSet<DefinitionId>>,
    pub(super) owner_stack: Vec<DefinitionId>,
    pub(super) uses: BTreeMap<String, ReferenceUse>,
    pub(super) active_expansions: BTreeSet<DefinitionId>,
}

/// A consistency error encountered while building or rendering the dependency graph.
#[derive(Clone, PartialEq, Eq, Snafu)]
pub enum DependencyError {
    #[snafu(display("The lookup name {lookup_name:?} resolves to both {first:?} and {second:?}"))]
    AmbiguousReference {
        lookup_name: String,
        first: DefinitionId,
        second: DefinitionId,
    },
    #[snafu(display("No parsed TypeScript definition exists for {definition:?}"))]
    MissingDefinition { definition: DefinitionId },
    #[snafu(display(
        "Definition resolution stack was corrupted: expected {expected:?}, found {found:?}"
    ))]
    ResolutionStackCorrupted {
        expected: DefinitionId,
        found: Option<DefinitionId>,
    },
}
