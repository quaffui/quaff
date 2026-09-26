use oxc_semantic::Semantic;

/// Reads original TypeScript text from parsed source spans.
pub trait SpanDisplay {
    /// Gets the source text of the span.
    fn display(&self, semantic: &Semantic) -> String;

    /// Gets source text when the optional span is present.
    fn display_option(opt: Option<&Self>, semantic: &Semantic) -> Option<String> {
        opt.as_ref().map(|span| span.display(semantic))
    }
}
