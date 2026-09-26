use super::consts::{ATTRIBUTES, SCRIPTS};

/// Yields script attributes and content while skipping comments and other markup.
pub(crate) fn extract_svelte_scripts(content: &str) -> impl Iterator<Item = (&str, &str)> {
    SCRIPTS
        .captures_iter(content)
        .filter_map(|script| Some((script.get(1)?.as_str(), script.get(2)?.as_str())))
}

/// Returns the first script that is not marked as a Svelte module script.
pub(super) fn instance_script(content: &str) -> Option<&str> {
    extract_svelte_scripts(content).find_map(|(attributes, script)| {
        let is_module = ATTRIBUTES.captures_iter(attributes).any(|attribute| {
            let name = attribute.get(1).map(|value| value.as_str());
            let value = attribute
                .get(2)
                .or(attribute.get(3))
                .or(attribute.get(4))
                .map(|value| value.as_str());

            name == Some("module") || (name == Some("context") && value == Some("module"))
        });

        if is_module { None } else { Some(script) }
    })
}
