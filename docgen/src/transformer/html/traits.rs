/// Renders parsed API types as documentation HTML with escaped text.
pub trait ToHtml {
    /// Consumes the value and renders its documentation markup.
    fn to_html(self) -> String;
}
