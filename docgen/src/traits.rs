use oxc_semantic::Semantic;

pub trait SpanDisplay {
    /// Gets the source text of the span
    fn display(&self, semantic: &Semantic) -> String;
    /// Safely get the source text of an optional span
    fn display_option(opt: Option<&Self>, semantic: &Semantic) -> Option<String> {
        opt.as_ref().map(|t| t.display(semantic))
    }
}
