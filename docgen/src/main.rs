mod cache;
mod component;
mod constants;
mod dependencies;
mod extractor;
mod host;
mod impls;
mod output;
mod parser;
mod pipeline;
mod prelude;
mod render;
mod resolver;
#[cfg(test)]
mod test_support;
mod traits;
mod transformer;

pub use prelude::{Result, W};
pub use traits::SpanDisplay;

fn main() -> Result<()> {
    if std::env::args().skip(1).eq(["generate"]) {
        return pipeline::generate();
    }

    Err("Expected `docgen generate`.".into())
}
