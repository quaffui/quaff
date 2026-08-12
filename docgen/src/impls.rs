use oxc::span::GetSpan;
use oxc_semantic::Semantic;

use super::SpanDisplay;

impl<T: GetSpan> SpanDisplay for T {
    fn display(&self, semantic: &Semantic) -> String {
        self.span().source_text(semantic.source_text()).to_string()
    }
}
