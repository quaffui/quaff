/// Implements parsing and display from the utility variants' TypeScript spellings.
macro_rules! impl_utility_enum {
    ($enum_name:ident, $($variant:ident),* $(,)?) => {
        impl FromStr for $enum_name {
            type Err = String;

            /// Parses the TypeScript name of a supported utility type.
            fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
                match s {
                    $(stringify!($variant) => Ok(Self::$variant),)*
                    _ => Err(format!("Unknown utility type: {}", s)),
                }
            }
        }

        impl Display for $enum_name {
            /// Writes the utility type's TypeScript name.
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                match self {
                    $(Self::$variant => write!(f, stringify!($variant)),)*
                }
            }
        }
    };
}

pub(crate) use impl_utility_enum;
