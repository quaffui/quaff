macro_rules! impl_utility_enum {
    ($enum_name:ident, $($variant:ident),* $(,)?) => {
        impl FromStr for $enum_name {
            type Err = String;

            fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
                match s {
                    $(stringify!($variant) => Ok(Self::$variant),)*
                    _ => Err(format!("Unknown utility type: {}", s)),
                }
            }
        }

        impl Display for $enum_name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                match self {
                    $(Self::$variant => write!(f, stringify!($variant)),)*
                }
            }
        }
    };
}

pub(super) use impl_utility_enum;
