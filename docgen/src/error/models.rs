use snafu::Snafu;

use crate::resolver::DependencyError;

/// Failures reported by docgen without changing their original diagnostic text.
#[derive(Snafu)]
pub enum Error {
    #[snafu(transparent)]
    Io { source: std::io::Error },
    #[snafu(transparent)]
    Json { source: serde_json::Error },
    #[snafu(transparent)]
    Clock { source: std::time::SystemTimeError },
    #[snafu(transparent)]
    Dependency {
        #[snafu(source(from(DependencyError, Box::new)))]
        source: Box<DependencyError>,
    },
    #[snafu(display("{message}"))]
    Message { message: String },
}
