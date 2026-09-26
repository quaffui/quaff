use std::fmt::{Debug, Formatter};

use super::Error;

impl Debug for Error {
    /// Preserves the CLI diagnostics previously printed for boxed source errors.
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Io { source } => Debug::fmt(source, formatter),
            Self::Json { source } => Debug::fmt(source, formatter),
            Self::Clock { source } => Debug::fmt(source, formatter),
            Self::Dependency { source } => Debug::fmt(source, formatter),
            Self::Message { message } => Debug::fmt(message, formatter),
        }
    }
}
