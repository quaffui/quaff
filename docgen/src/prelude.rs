pub use crate::error::Error;

/// Wraps external types so docgen can implement external traits for them.
pub struct W<T>(pub T);

/// The shared result type for parsing and generating documentation.
pub type Result<T> = std::result::Result<T, Error>;
