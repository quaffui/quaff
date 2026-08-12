use std::collections::BTreeMap;

use crate::{parser::ParsedPropsInterface, prelude::*, resolver::PathResolver};

/// Trait for parsing `props.ts` files to extract the props interfaces.
pub trait TSPropsParser {
    fn parse_props(
        &self,
        resolver: &PathResolver,
    ) -> Result<BTreeMap<String, ParsedPropsInterface>>;
}
