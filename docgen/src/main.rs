mod constants;
mod extractor;
mod impls;
mod ipc;
mod parser;
mod prelude;
mod resolver;
mod traits;
mod transformer;

pub use prelude::{Result, W};
pub use traits::SpanDisplay;

fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().skip(1);

    match (args.next().as_deref(), args.next()) {
        (Some("generate"), None) => ipc::generate(),
        (Some(command), _) => Err(format!("Unknown docgen command: {command}").into()),
        (None, _) => Err("Missing docgen command. Expected `generate`.".into()),
    }
}
