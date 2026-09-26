use oxc_semantic::{AstNode, Semantic};

use crate::Result;

/// Visits parsed nodes and returns whether traversal should stop.
pub trait ParseCallback<'a>: FnMut(&AstNode, &Semantic<'a>) -> Result<bool> {}

/// Parses TypeScript source or script content from a source file.
pub trait ParseSource {
    /// Visits source nodes, stopping when the callback returns `true`.
    fn parse_source<U: for<'a> ParseCallback<'a>>(&self, callback: U) -> Result<()> {
        let _ = callback;
        Ok(())
    }
}
