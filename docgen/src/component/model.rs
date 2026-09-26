use std::{collections::BTreeMap, path::PathBuf};

use serde::Serialize;

use crate::transformer::html::QApiPropInfo;

pub struct DocgenComponentInput {
    pub props_file: PathBuf,
    pub svelte_files: Vec<PathBuf>,
}

pub struct DocgenComponentOutput {
    pub props_file: PathBuf,
    pub interfaces: Vec<DocgenInterface>,
}

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
pub struct QApiGeneric {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub constraint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,
}
