use super::TsPrecedence;

/// Renders a parsed type as valid TypeScript source.
pub trait ToTs {
    fn to_ts(&self) -> String;

    fn ts_precedence(&self) -> TsPrecedence {
        TsPrecedence::Primary
    }

    fn to_ts_nested(&self, parent: TsPrecedence) -> String {
        let rendered = self.to_ts();

        if self.ts_precedence() < parent {
            format!("({rendered})")
        } else {
            rendered
        }
    }
}

/// Renders a named declaration, optionally under a local import alias.
pub trait ToTsDefinition {
    fn to_ts_definition(&self) -> String;
    fn to_ts_definition_as(&self, name: &str) -> String;
}
