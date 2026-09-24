use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::transformer::html::QApiPropInfo;

pub const PROTOCOL_VERSION: u32 = 1;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DocgenRequest {
    pub version: u32,
    pub components: Vec<DocgenComponentInput>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DocgenComponentInput {
    pub props_file: String,
    pub svelte_files: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct DocgenResponse {
    pub version: u32,
    pub components: Vec<DocgenComponentOutput>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocgenComponentOutput {
    pub props_file: String,
    pub interfaces: Vec<DocgenInterface>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocgenInterface {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub component_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub generics: Vec<QApiGeneric>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dom_attributes_constraint: Option<String>,
    pub props: Vec<QApiPropInfo>,
    pub snippets: Vec<QApiPropInfo>,
    pub methods: Vec<QApiPropInfo>,
    pub type_dependencies: BTreeMap<String, String>,
}

#[derive(Debug, Serialize)]
pub struct QApiGeneric {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub constraint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,
}
