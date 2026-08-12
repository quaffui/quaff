use oxc_semantic::{AstNode, Semantic};

use crate::Result;

pub trait ParseCallback<'a>: FnMut(&AstNode, &Semantic<'a>) -> Result<bool> {}

pub trait ParseSource {
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, callback: U) -> Result<()> {
        let _ = callback;
        Ok(())
    }
}
