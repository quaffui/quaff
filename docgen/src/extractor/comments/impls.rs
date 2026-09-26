use oxc::span::Span;
use oxc_semantic::Semantic;

use crate::{
    Result, SpanDisplay,
    extractor::Extractor,
    resolver::{PathResolver, TypeRegistry},
};

use super::{CommentInfo, funcs::clean_comment_line};

impl Default for CommentInfo {
    fn default() -> Self {
        Self {
            description: "No description provided.".to_string(),
            default: None,
        }
    }
}

impl Extractor<Option<CommentInfo>> for Span {
    fn extract(
        &self,
        semantic: &Semantic,
        _resolver: &PathResolver,
        _registry: &mut TypeRegistry,
    ) -> Result<Option<CommentInfo>> {
        let maybe_comment = semantic
            .comments()
            .iter()
            .filter(|comment| comment.attached_to == self.start)
            .find(|comment| {
                comment
                    .span
                    .display(semantic)
                    .trim_start()
                    .starts_with("/**")
            });

        let Some(comment) = maybe_comment else {
            return Ok(None);
        };

        let content = comment.span.display(semantic);

        let mut description_lines = Vec::new();
        let mut default = None;

        let lines: Vec<&str> = content.lines().collect();

        for line in lines {
            let text = clean_comment_line(line);

            if text.starts_with("@default") {
                if let Some(default_value) = text.strip_prefix("@default") {
                    default = Some(default_value.trim().to_string())
                }

                continue;
            }

            let trimmed = text.trim();
            if trimmed.is_empty() {
                continue;
            }

            description_lines.push(trimmed.to_string());
        }

        Ok(Some(CommentInfo {
            description: description_lines.join("\n"),
            default,
        }))
    }
}
