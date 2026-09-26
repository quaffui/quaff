use std::{fs::read_to_string, sync::LazyLock};

use oxc::{
    allocator::Allocator,
    parser::{Parser, ParserReturn},
    span::SourceType as OxcSrcType,
};
use oxc_semantic::{AstNode, Semantic, SemanticBuilder};
use regex::Regex;

use crate::Result;

use super::{ParseSource, SourceType, traits::ParseCallback};

impl<'a, T: FnMut(&AstNode, &Semantic<'a>) -> Result<bool>> ParseCallback<'a> for T {}

impl ParseSource for String {
    /// Parses the given TS code and calls `cb` for each AST node.
    ///
    /// If `cb` returns `true`, the node lookup will stop and the function will return.
    /// Else the parsing will continue with the next node.
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, mut callback: U) -> Result<()> {
        let allocator = Allocator::default();
        let src_type = OxcSrcType::ts();
        let ParserReturn {
            program,
            diagnostics,
            ..
        } = Parser::new(&allocator, self, src_type).parse();

        if !diagnostics.is_empty() {
            return Err(format!(
                "Invalid TypeScript source: {}",
                diagnostics
                    .iter()
                    .map(ToString::to_string)
                    .collect::<Vec<_>>()
                    .join("; ")
            )
            .into());
        }

        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program)
            .semantic;

        for node in semantic.nodes() {
            if callback(node, &semantic)? {
                break;
            }
        }

        Ok(())
    }
}

impl<'b> ParseSource for SourceType<'b> {
    /// Parses the given source file and calls `cb` for each AST node.
    ///
    /// If `cb` returns `true`, the node lookup will stop and the function will return.
    /// Else the parsing will continue with the next node.
    ///
    /// For Svelte files, parses the instance script and leaves module exports out of component docs.
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, callback: U) -> Result<()> {
        match self {
            Self::TS(path) => {
                let content = read_to_string(path)?;
                content.parse_source(callback)
            }
            Self::Svelte(path) => {
                let content = read_to_string(path)?;

                if let Some(script) = instance_script(&content) {
                    script.to_string().parse_source(callback)
                } else {
                    Ok(())
                }
            }
        }
    }
}

pub(crate) fn extract_svelte_scripts(content: &str) -> impl Iterator<Item = (&str, &str)> {
    static SCRIPTS: LazyLock<Regex> = LazyLock::new(|| {
        // Consume whole tags and raw-text blocks so comment markers in their contents stay intact.
        Regex::new(
            r#"(?sx)
                <!--.*?-->
                |<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>(.*?)</script\s*>
                |<style\b(?:[^>"']|"[^"]*"|'[^']*')*>.*?</style\s*>
                |</?[A-Za-z][A-Za-z0-9:.-]*(?:[^>"']|"[^"]*"|'[^']*')*>
            "#,
        )
        .unwrap()
    });
    SCRIPTS
        .captures_iter(content)
        .filter_map(|script| Some((script.get(1)?.as_str(), script.get(2)?.as_str())))
}

fn instance_script(content: &str) -> Option<&str> {
    static ATTRIBUTES: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r#"(?:^|\s)([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?"#).unwrap()
    });

    extract_svelte_scripts(content).find_map(|(attributes, script)| {
        let is_module = ATTRIBUTES.captures_iter(attributes).any(|attribute| {
            let name = attribute.get(1).map(|value| value.as_str());
            let value = attribute
                .get(2)
                .or(attribute.get(3))
                .or(attribute.get(4))
                .map(|value| value.as_str());

            name == Some("module") || (name == Some("context") && value == Some("module"))
        });

        if is_module { None } else { Some(script) }
    })
}

#[cfg(test)]
mod tests {
    use super::{ParseSource, instance_script};

    #[test]
    fn reads_instance_scripts_with_reordered_attributes_and_skips_modules() {
        let source = r#"
            <script lang="ts" module>export const shared = 1;</script>
            <script generics="T extends Record<string, unknown>" lang='ts'>let { value } = $props();</script>
        "#;
        assert_eq!(instance_script(source), Some("let { value } = $props();"));
        assert_eq!(
            instance_script("<script context='module'>export const shared = 1;</script>"),
            None
        );
        assert_eq!(instance_script("<div>No script</div>"), None);
    }

    #[test]
    fn skips_commented_scripts_without_stripping_script_string_contents() {
        let live_script = r#"let { value = "<!--live-->", marker = "<!--" } = $props();"#;
        let source = format!(
            r#"
                <!-- <script lang="ts">let {{ value = "wrong" }} = $props();</script> -->
                <script module>const marker = "<!--";</script>
                <!-- Another comment containing <script>invalid TypeScript</script> -->
                <script lang="ts">{live_script}</script>
            "#
        );
        assert_eq!(instance_script(&source), Some(live_script));
        assert_eq!(
            instance_script("<!-- <script>commentedOut()</script> -->"),
            None
        );
    }

    #[test]
    fn quoted_comment_markers_before_scripts_do_not_hide_scripts() {
        let live_script = r#"let { value = "-->" } = $props();"#;

        for prefix in [
            r#"<div title="<!--"></div>"#,
            r#"<div title='<!--'></div>"#,
            r#"<style>.marker::before { content: "<!--" }</style>"#,
        ] {
            let source = format!("{prefix}<script lang=\"ts\">{live_script}</script>");
            assert_eq!(instance_script(&source), Some(live_script), "{prefix}");
        }
    }

    #[test]
    fn rejects_invalid_typescript_instead_of_emitting_partial_docs() {
        let result = "export interface Props { value: }"
            .to_string()
            .parse_source(|_, _| Ok(false));
        assert!(result.is_err());
    }
}
