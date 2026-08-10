use std::{collections::HashMap, path::Path};

use oxc::ast::{AstKind, ast::Declaration};

use crate::{
    parser::{
        source::{ParseSource, SourceType},
        types::{
            TypeDependencies,
            interfaces::{Interface, InterfaceParser},
        },
    },
    prelude::*,
    resolver::PathResolver,
};

use super::TSPropsParser;

impl TSPropsParser for Path {
    fn parse_props(&self, resolver: &PathResolver) -> Result<HashMap<String, Interface>> {
        let mut parsed_interfaces = HashMap::new();

        SourceType::TS(self).parse_source(|node, semantic| {
            if let AstKind::ExportDeclaration(export) = node.kind()
                && let Declaration::TSInterfaceDeclaration(interface) = &export.declaration
                && interface.id.name.ends_with("Props")
            {
                let mut type_deps: TypeDependencies = HashMap::new();

                let parsed_interface = interface.parse(semantic, resolver, &[], &mut type_deps)?;

                parsed_interfaces.insert(parsed_interface.name.clone(), parsed_interface);
            }

            Ok(false)
        })?;

        Ok(parsed_interfaces)
    }
}
