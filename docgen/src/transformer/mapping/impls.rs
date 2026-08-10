use std::sync::OnceLock;

use regex::Regex;

use super::model::TypeSrcMapping;

impl TypeSrcMapping {
    /// Creates a new string-based mapping
    pub(super) const fn new_string(src: &'static str, value: &'static str) -> Self {
        Self {
            src,
            is_regex: false,
            regex_cache: OnceLock::new(),
            value,
        }
    }

    /// Creates a new regex-based mapping
    pub(super) const fn new_regex(src: &'static str, value: &'static str) -> Self {
        Self {
            src,
            is_regex: true,
            regex_cache: OnceLock::new(),
            value,
        }
    }

    /// Returns the compiled regex, compiling it on first access.
    fn regex(&self) -> &Regex {
        self.regex_cache
            .get_or_init(|| Regex::new(self.src).unwrap())
    }

    /// Checks if the given name matches the source of this mapping.
    pub fn matches(&self, name: &str) -> bool {
        if self.is_regex {
            self.regex().is_match(name)
        } else {
            self.src == name
        }
    }

    /// Maps the given name to its documentation URL.
    ///
    /// As replacing `name` directly would break things for cases like `Omit<HTMLButtonAttributes, "disabled">`,
    /// we instead capture only the part of the string that matches the regex (`HTMLButtonAttributes` in our example)
    /// and map that to its corresponding documentation URL.
    ///
    /// Returns a tuple of (capture, type_src)
    pub fn map(&self, name: &str) -> (String, String) {
        if self.is_regex {
            let Some(capture) = self
                .regex()
                .captures(name)
                .map(|caps| caps.get(0))
                .flatten()
            else {
                panic!(
                    "Failed to capture regex match for {}, which should not happen as match was checked beforehand.",
                    name
                );
            };

            let src = self.regex().replace_all(capture.as_str(), self.value);
            (capture.as_str().to_string(), src.to_string())
        } else {
            (name.to_string(), self.src.to_string())
        }
    }
}
