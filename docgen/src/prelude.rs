/// A wrapper around a type to allow external types to implement external traits
pub struct W<T>(pub T);

/// A wrapper for the `Result` type to get Box<dyn Error> instead of Result<T, E>
pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
