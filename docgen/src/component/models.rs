use std::{collections::BTreeMap, path::PathBuf};

use serde::Serialize;

use crate::transformer::QApiPropInfo;

/// Source files needed to generate one component documentation entry.
pub struct DocgenComponentInput {
    pub props_file: PathBuf,
    pub svelte_files: Vec<PathBuf>,
}

/// Documentation interfaces generated from a single props file.
pub struct DocgenComponentOutput {
    pub props_file: PathBuf,
    pub interfaces: Vec<DocgenInterface>,
}

/// Rendered component API, including properties, methods, and type dependencies.
pub struct DocgenInterface {
    pub name: String,
    pub component_name: Option<String>,
    pub description: Option<String>,
    pub generics: Vec<QApiGeneric>,
    pub dom_attributes_constraint: Option<String>,
    pub props: Vec<QApiPropInfo>,
    pub snippets: Vec<QApiPropInfo>,
    pub methods: Vec<QApiPropInfo>,
    pub type_dependencies: BTreeMap<String, String>,
}

#[derive(Serialize)]
/// Serialized documentation for a generic parameter and its bounds.
pub struct QApiGeneric {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub constraint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,
}
