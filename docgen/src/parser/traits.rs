use std::collections::HashMap;

use crate::{parser::types::interfaces::Interface, prelude::*, resolver::PathResolver};

/// Trait for parsing `props.ts` files to extract the props interfaces.
pub trait TSPropsParser {
    fn parse_props(&self, resolver: &PathResolver) -> Result<HashMap<String, Interface>>;
}
