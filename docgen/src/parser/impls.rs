use std::{collections::BTreeMap, path::Path};

use oxc::ast::{AstKind, ast::Declaration};

use crate::{
    extractor::GenericBindings,
    parser::{InterfaceParser, ParseSource, ParsedPropsInterface, SourceType},
    prelude::*,
    resolver::{PathResolver, TypeRegistry},
};

use super::TSPropsParser;

impl TSPropsParser for Path {
    /// Collects exported props interfaces and their transitive type definitions.
    fn parse_props(
        &self,
        resolver: &PathResolver,
    ) -> Result<BTreeMap<String, ParsedPropsInterface>> {
        let mut parsed_interfaces = BTreeMap::new();
        let registry_root = self
            .ancestors()
            .find(|path| path.ends_with("lib"))
            .or_else(|| self.parent())
            .unwrap_or(self);

        SourceType::TS(self).parse_source(|node, semantic| {
            if let AstKind::ExportDeclaration(export) = node.kind()
                && let Declaration::TSInterfaceDeclaration(interface) = &export.declaration
                && interface.id.name.ends_with("Props")
            {
                let mut registry = TypeRegistry::new(registry_root);

                let parsed_interface = interface.parse(
                    semantic,
                    resolver,
                    &GenericBindings::default(),
                    &mut registry,
                )?;
                let type_definitions = registry.build_type_definitions()?;

                parsed_interfaces.insert(
                    parsed_interface.name.clone(),
                    ParsedPropsInterface {
                        interface: parsed_interface,
                        type_definitions,
                    },
                );
            }

            Ok(false)
        })?;

        Ok(parsed_interfaces)
    }
}
