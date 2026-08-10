/// Creates an HTML item that can be used to build HTML content.
/// It is not a "HTML tag" but a struct that can be converted to an HTML tag.
pub struct HtmlItem {
    /// The content of the HTML item, which would be the text content of an HTML tag
    pub(super) content: String,
    /// Whether the HTML element should have an accented style (i.e. `accented` class)
    pub(super) accent: bool,
    /// Whether the HTML item is a reference to a type (i.e. `clickable` class and `data-quaff` attribute)
    pub(super) is_reference: bool,
    /// The name of the type the HTML item is a reference to
    pub(super) type_name: String,
    /// The href source the anchor tag should lead to
    pub(super) type_src: String,
    /// Classes to add to the HTML element
    pub(super) class: Option<String>,
    /// The HTML tag to use for the HTML item
    pub(super) tag: Option<String>,
}

#[derive(Debug)]
/// Information about a property that will be displayed in the API documentation.
pub struct QApiPropInfo {
    /// The html content of the header, with the prop name, default and type definition
    pub header: String,
    /// The description of the property
    pub description: String,
}
