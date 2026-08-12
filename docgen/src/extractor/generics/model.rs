use std::collections::HashMap;

use crate::parser::types::{ParsedType, StandardType};

/// Concrete values assigned to generic type parameters in the current declaration scope.
#[derive(Debug, Clone, Default)]
pub struct GenericBindings(HashMap<String, ParsedType>);

impl GenericBindings {
    /// Returns the concrete type assigned to a generic parameter.
    pub fn get(&self, name: &str) -> Option<&ParsedType> {
        self.0.get(name)
    }

    /// Adds unbound generic parameters to this scope without replacing concrete bindings.
    pub fn with_missing_generics(&self, generics: &[GenericInfo]) -> Self {
        let mut bindings = self.clone();

        for generic in generics {
            bindings
                .0
                .entry(generic.name.clone())
                .or_insert_with(|| generic.as_unbound_type());
        }

        bindings
    }

    /// Adds generic parameters to a nested scope, shadowing parameters with the same names.
    pub fn with_shadowed_generics(&self, generics: &[GenericInfo]) -> Self {
        let mut bindings = self.clone();

        for generic in generics {
            bindings
                .0
                .insert(generic.name.clone(), generic.as_unbound_type());
        }

        bindings
    }

    pub(super) fn insert(&mut self, name: String, parsed: ParsedType) {
        self.0.insert(name, parsed);
    }
}

/// Represents a generic type parameter of an interface (e.g. `<T extends string>`).
#[derive(Debug, Clone)]
pub struct GenericInfo {
    /// Name of the generic type parameter (e.g. "T")
    pub name: String,
    /// Constraint text if the generic extends a type (e.g. "string")
    pub constraint: Option<ParsedType>,
    /// Default value if the generic has one (e.g. "T = string")
    pub default: Option<ParsedType>,
}

impl GenericInfo {
    fn as_unbound_type(&self) -> ParsedType {
        ParsedType::Standard(StandardType::new(self.name.clone()))
    }
}
