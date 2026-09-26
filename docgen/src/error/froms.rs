use super::Error;

impl From<String> for Error {
    fn from(message: String) -> Self {
        Self::Message { message }
    }
}

impl From<&str> for Error {
    fn from(message: &str) -> Self {
        message.to_owned().into()
    }
}
