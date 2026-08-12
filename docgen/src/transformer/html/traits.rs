pub trait ToHtml {
    fn to_html(self) -> String;

    fn needs_html_braces(&self) -> bool {
        false
    }
}
