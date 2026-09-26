use super::TsPrecedence;

/// Renders a parsed type as valid TypeScript source.
pub trait ToTs {
    /// Renders this value as a standalone TypeScript expression.
    fn to_ts(&self) -> String;

    /// Returns the precedence used when nesting this type in another expression.
    fn ts_precedence(&self) -> TsPrecedence {
        TsPrecedence::Primary
    }

    /// Renders this type with parentheses when its parent operator requires them.
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
    /// Renders the declaration under its original name.
    fn to_ts_definition(&self) -> String;
    /// Renders the declaration under a supplied local alias.
    fn to_ts_definition_as(&self, name: &str) -> String;
}
