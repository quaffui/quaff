use std::str::FromStr;

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
