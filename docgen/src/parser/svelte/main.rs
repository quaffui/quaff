use std::{collections::HashMap, path::Path};

use oxc::ast::ast::BindingProperty;

use crate::{
    Result,
    parser::{
        source::{ParseSource, SourceType},
        svelte::{
            methods::{ExportedMethod, ParsedSvelteMethods},
            props::ParsedSvelteProps,
            traits::SvelteParser,
        },
    },
    resolver::PathResolver,
};

/// Function that parses the Svelte file associated with the component currently parsed.
/// It tries to extract the relevant props information (defaults and bindable state)
/// as well as the user-exposed methods defined in the component.
pub fn parse_svelte_file(svelte_file: &Path) -> Result<(ParsedSvelteProps, ParsedSvelteMethods)> {
    let resolver = PathResolver(svelte_file);

    let mut defaults = HashMap::new();
    let mut methods = HashMap::new();

    SourceType::Svelte(svelte_file).parse_source(|node, semantic| {
        if let Some(mut props) = <&[BindingProperty]>::extract(node) {
            defaults.extend(props.parse(semantic, &resolver)?);
        } else {
            for method in ExportedMethod::extract(node, semantic) {
                let (name, method_info) = method.parse(semantic, &resolver)?;
                methods.insert(name, method_info);
            }
        }

        Ok(false)
    })?;

    Ok((defaults, methods))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::transformer::typescript::ToTs;

    #[test]
    fn defaulted_method_parameters_are_optional() -> Result<()> {
        let resolver = PathResolver(Path::new("/virtual/QSnackbar.svelte"));
        let mut method = None;
        r#"type DismissReason = "programmatic" | "timeout"; export function hide(reason: DismissReason = "programmatic") {}"#.to_string().parse_source(|node, semantic| {
            for function in ExportedMethod::extract(node, semantic) {
                method = Some(function.parse(semantic, &resolver)?.1);
            }

            Ok(false)
        })?;
        let method = method.unwrap();
        assert!(method.function_type.params[0].optional);
        assert_eq!(
            method.type_definitions["DismissReason"],
            "type DismissReason = \"programmatic\" | \"timeout\";"
        );

        Ok(())
    }

    #[test]
    fn defaults_before_required_parameters_accept_undefined_without_becoming_optional() -> Result<()>
    {
        let resolver = PathResolver(Path::new("/virtual/Fixture.svelte"));
        let mut method = None;
        r#"export function example(first: string = "default", second: string, third: number = 1) {}"#
            .to_string()
            .parse_source(|node, semantic| {
                for function in ExportedMethod::extract(node, semantic) {
                    method = Some(function.parse(semantic, &resolver)?.1);
                }

                Ok(false)
            })?;
        let method = method.unwrap();
        let params = &method.function_type.params;
        assert!(!params[0].optional);
        assert!(!params[1].optional);
        assert!(params[2].optional);
        assert_eq!(params[0].type_annotation.to_ts(), "string | undefined");
        assert_eq!(
            method.function_type.to_ts(),
            "(first: string | undefined, second: string, third?: number) => void"
        );

        Ok(())
    }

    #[test]
    fn extracts_all_exported_arrow_methods_without_private_or_nested_functions() -> Result<()> {
        let resolver = PathResolver(Path::new("/virtual/Fixture.svelte"));
        let mut methods = HashMap::new();
        r#"
            type Reason = "manual" | "timeout";
            /** Opens it. */
            export const show = (reason: Reason = "manual", event?: MouseEvent) => {},
                /** Counts values. */
                count = (...values: number[]): number => values.length;
            export const data = { callback: () => {} };
            const privateMethod = () => {};
            namespace Internal { export const nested = () => {}; }
            export function outer(): void { const nested = () => {}; }
        "#
        .to_string()
        .parse_source(|node, semantic| {
            for method in ExportedMethod::extract(node, semantic) {
                let (name, method) = method.parse(semantic, &resolver)?;
                methods.insert(name, method);
            }

            Ok(false)
        })?;
        assert_eq!(methods.len(), 3);
        assert_eq!(methods["show"].description, "Opens it.");
        assert_eq!(
            methods["show"].function_type.to_ts(),
            "(reason?: Reason, event?: MouseEvent) => void"
        );
        assert_eq!(
            methods["show"].type_definitions["Reason"],
            r#"type Reason = "manual" | "timeout";"#
        );
        assert_eq!(methods["count"].description, "Counts values.");
        assert_eq!(
            methods["count"].function_type.to_ts(),
            "(...values: number[]) => number"
        );
        assert!(methods.contains_key("outer"));

        Ok(())
    }
}
