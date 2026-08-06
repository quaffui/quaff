use oxc::span::GetSpan;
use oxc_semantic::Semantic;

/// A wrapper around a type to allow external types to implement external traits
pub struct W<T>(pub T);

pub trait SpanDisplay {
    fn display(&self, semantic: &Semantic) -> String;
    fn display_option(opt: Option<&Self>, semantic: &Semantic) -> Option<String> {
        opt.as_ref().map(|t| t.display(semantic))
    }
}

impl<T: GetSpan> SpanDisplay for T {
    fn display(&self, semantic: &Semantic) -> String {
        self.span().source_text(semantic.source_text()).to_string()
    }
}

/// A wrapper for the `Result` type to get Box<dyn Error> instead of Result<T, E>
pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
