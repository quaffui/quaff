pub trait ToHtml {
    fn to_html(self) -> String;

    fn to_html_joined(self, joiner: &str) -> String
    where
        Self: Sized + IntoIterator<Item = Self> + ToHtml,
    {
        self.into_iter()
            .map(|t| {
                if t.needs_html_braces() {
                    format!("({})", t.to_html())
                } else {
                    t.to_html()
                }
            })
            .collect::<Vec<String>>()
            .join(&format!(" {} ", joiner))
    }

    fn needs_html_braces(&self) -> bool {
        false
    }
}
