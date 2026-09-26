use std::io::Write;

use serde::de::DeserializeOwned;

use crate::Result;

use super::{models::Request, read_message};

impl Request<'_> {
    /// Sends one JSON request and reads its response before releasing stdout.
    pub(super) fn send<T: DeserializeOwned>(self) -> Result<T> {
        let mut stdout = std::io::stdout().lock();
        serde_json::to_writer(&mut stdout, &self)?;
        writeln!(stdout)?;
        stdout.flush()?;
        read_message()
    }
}
