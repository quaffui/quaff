use std::{collections::BTreeMap, path::Path};

use oxc::ast::{AstKind, ast::Declaration};

use crate::{
    extractor::generics::GenericBindings,
    parser::{
        ParsedPropsInterface,
        source::{ParseSource, SourceType},
        types::interfaces::InterfaceParser,
    },
    prelude::*,
    resolver::{PathResolver, dependency::TypeRegistry},
};

use super::TSPropsParser;

impl TSPropsParser for Path {
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

#[cfg(test)]
mod tests {
    use std::{
        fs::{create_dir_all, remove_dir_all, write},
        path::{Path, PathBuf},
        time::{SystemTime, UNIX_EPOCH},
    };

    use crate::{parser::TSPropsParser, resolver::PathResolver};

    struct FixtureDir(PathBuf);

    impl FixtureDir {
        fn new() -> Self {
            let nonce = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock should be after the Unix epoch")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "quaff-docgen-parser-{}-{nonce}",
                std::process::id()
            ));
            create_dir_all(&path).expect("fixture directory should be created");

            Self(path)
        }

        fn write(&self, name: &str, source: &str) -> PathBuf {
            let path = self.0.join(name);
            create_dir_all(path.parent().expect("fixture file should have a parent"))
                .expect("fixture parent directory should be created");
            write(&path, source).expect("fixture source should be written");
            path
        }
    }

    impl Drop for FixtureDir {
        fn drop(&mut self) {
            let _ = remove_dir_all(&self.0);
        }
    }

    fn parse_fixture(
        source: &str,
    ) -> crate::Result<std::collections::BTreeMap<String, crate::parser::ParsedPropsInterface>>
    {
        let fixture = FixtureDir::new();
        let path = fixture.write("props.ts", source);
        let resolver = PathResolver(Path::new(&path));

        path.parse_props(&resolver)
    }

    fn parse_path(
        path: &Path,
    ) -> crate::Result<std::collections::BTreeMap<String, crate::parser::ParsedPropsInterface>>
    {
        let resolver = PathResolver(path);
        path.parse_props(&resolver)
    }

    #[test]
    fn emits_transitive_definitions_in_dependency_order() -> crate::Result<()> {
        let parsed = parse_fixture(
            r#"
                type QSize = "none" | "sm" | "md";
                type QBtnSizeOptions = Exclude<QSize, "none">;
                export interface QBtnProps { size?: QBtnSizeOptions }
            "#,
        )?;

        assert_eq!(
            parsed["QBtnProps"].type_definitions["QBtnSizeOptions"],
            "type QSize = \"none\" | \"sm\" | \"md\";\n\ntype QBtnSizeOptions = Exclude<QSize, \"none\">;"
        );

        Ok(())
    }

    #[test]
    fn emits_generic_use_lookup_with_argument_dependencies() -> crate::Result<()> {
        let parsed = parse_fixture(
            r#"
                type QSize = "sm" | "md";
                type Box<T> = { value: T };
                export interface GenericProps { box: Box<QSize> }
            "#,
        )?;
        let docs = &parsed["GenericProps"];

        assert_eq!(
            docs.type_definitions["Box<QSize>"],
            "type QSize = \"sm\" | \"md\";\n\ntype Box<T> = {\n  value: T;\n};"
        );
        let crate::parser::types::ParsedType::Reference(reference) =
            &docs.interface.properties[0].type_annotation
        else {
            panic!("expected a generic reference")
        };
        assert_eq!(reference.name, "Box");
        assert_eq!(reference.type_args.len(), 1);
        let crate::parser::types::ParsedType::TypeLiteral(properties) = reference.parsed.as_ref()
        else {
            panic!("expected the instantiated Box body")
        };
        let crate::parser::types::ParsedType::Reference(instantiated_value) =
            &properties[0].type_annotation
        else {
            panic!("expected the instantiated QSize reference")
        };
        assert_eq!(instantiated_value.name, "QSize");
        assert!(matches!(
            instantiated_value.parsed.as_ref(),
            crate::parser::types::ParsedType::Union(values) if values.len() == 2
        ));

        Ok(())
    }

    #[test]
    fn emits_mutually_recursive_definitions_once_and_target_last() -> crate::Result<()> {
        let parsed = parse_fixture(
            r#"
                type A = { b: B };
                type B = { a: A };
                export interface CycleProps { value: A }
            "#,
        )?;
        let definition = &parsed["CycleProps"].type_definitions["A"];

        assert_eq!(
            definition,
            "type B = {\n  a: A;\n};\n\ntype A = {\n  b: B;\n};"
        );
        assert_eq!(definition.matches("type A =").count(), 1);
        assert_eq!(definition.matches("type B =").count(), 1);

        Ok(())
    }

    #[test]
    fn resolves_imported_transitive_definitions_from_a_stable_lib_root() -> crate::Result<()> {
        let fixture = FixtureDir::new();
        fixture.write(
            "lib/utils/index.ts",
            r#"
                export type QSize = "none" | "md";
                export type QBtnSizeOptions = Exclude<QSize, "none">;
            "#,
        );
        let props = fixture.write(
            "lib/components/button/props.ts",
            r#"
                import type { QBtnSizeOptions } from "$utils";
                export interface QBtnProps { size?: QBtnSizeOptions }
            "#,
        );

        let parsed = parse_path(&props)?;
        assert_eq!(
            parsed["QBtnProps"].type_definitions["QBtnSizeOptions"],
            "type QSize = \"none\" | \"md\";\n\ntype QBtnSizeOptions = Exclude<QSize, \"none\">;"
        );

        Ok(())
    }

    #[test]
    fn extended_interface_is_omitted_from_type_definitions() -> crate::Result<()> {
        let parsed = parse_fixture(
            r#"
                type SizeValue = "sm" | "md";
                interface Sizeable {
                    size?: SizeValue;
                }
                export interface ChildProps extends Sizeable {
                    child?: string;
                }
                export interface ParentProps {
                    prop?: ChildProps;
                }
            "#,
        )?;
        let child_def = &parsed["ParentProps"].type_definitions["ChildProps"];
        assert!(!child_def.contains("interface Sizeable"));
        assert!(child_def.contains("type SizeValue = \"sm\" | \"md\";"));
        assert!(child_def.contains("interface ChildProps {"));
        assert!(child_def.contains("size?: SizeValue;"));
        assert!(child_def.contains("child?: string;"));

        Ok(())
    }
}
