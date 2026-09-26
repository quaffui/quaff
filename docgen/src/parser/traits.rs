use std::collections::BTreeMap;

use crate::{parser::ParsedPropsInterface, prelude::*, resolver::PathResolver};

/// Trait for parsing `props.ts` files to extract the props interfaces.
pub trait TSPropsParser {
    /// Parses exported props interfaces using the supplied reference resolver.
    fn parse_props(
        &self,
        resolver: &PathResolver,
    ) -> Result<BTreeMap<String, ParsedPropsInterface>>;
}
