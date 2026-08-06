use oxc::span::GetSpan;
use oxc_semantic::Semantic;

/// A wrapper around a type to allow external types to implement external traits
pub struct W<T>(pub T);

impl<T: GetSpan> W<Option<&T>> {
    pub fn display(self, semantic: &Semantic) -> Option<String> {
        self.0
            .map(|x| x.span().source_text(semantic.source_text()).to_string())
    }
}

impl<T: GetSpan> W<&T> {
    pub fn display(self, semantic: &Semantic) -> Option<String> {
        Some(
            self.0
                .span()
                .source_text(semantic.source_text())
                .to_string(),
        )
    }
}

/// A wrapper for the `Result` type to get Box<dyn Error> instead of Result<T, E>
pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
