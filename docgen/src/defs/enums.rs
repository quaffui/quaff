use std::{fmt::Display, str::FromStr};

/// Typescript utility types that are used with a single type argument, e.g. `Partial<T>`
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum UtilityTKind {
    Array,
    InstanceType,
    NonNullable,
    Parameters,
    Partial,
    Readonly,
    Required,
    ReturnType,
}

impl FromStr for UtilityTKind {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Array" => Ok(UtilityTKind::Array),
            "InstanceType" => Ok(UtilityTKind::InstanceType),
            "NonNullable" => Ok(UtilityTKind::NonNullable),
            "Parameters" => Ok(UtilityTKind::Parameters),
            "Partial" => Ok(UtilityTKind::Partial),
            "Readonly" => Ok(UtilityTKind::Readonly),
            "Required" => Ok(UtilityTKind::Required),
            "ReturnType" => Ok(UtilityTKind::ReturnType),
            _ => Err(format!("Unknown utility type: {}", s)),
        }
    }
}

impl Display for UtilityTKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Array => write!(f, "Array"),
            Self::InstanceType => write!(f, "InstanceType"),
            Self::NonNullable => write!(f, "NonNullable"),
            Self::Parameters => write!(f, "Parameters"),
            Self::Partial => write!(f, "Partial"),
            Self::Readonly => write!(f, "Readonly"),
            Self::Required => write!(f, "Required"),
            Self::ReturnType => write!(f, "ReturnType"),
        }
    }
}

/// Typescript utility types that are used with two type arguments, e.g. `Record<K, T>`
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum UtilityKVKind {
    Exclude,
    Extract,
    Omit,
    Pick,
    Record,
}

impl FromStr for UtilityKVKind {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Exclude" => Ok(UtilityKVKind::Exclude),
            "Extract" => Ok(UtilityKVKind::Extract),
            "Omit" => Ok(UtilityKVKind::Omit),
            "Pick" => Ok(UtilityKVKind::Pick),
            "Record" => Ok(UtilityKVKind::Record),
            _ => Err(format!("Unknown utility type: {}", s)),
        }
    }
}

impl Display for UtilityKVKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Exclude => write!(f, "Exclude"),
            Self::Extract => write!(f, "Extract"),
            Self::Omit => write!(f, "Omit"),
            Self::Pick => write!(f, "Pick"),
            Self::Record => write!(f, "Record"),
        }
    }
}
