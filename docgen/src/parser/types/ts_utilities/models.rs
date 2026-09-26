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

/// Typescript utility types that are used with two type arguments, e.g. `Record<K, T>`
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum UtilityKVKind {
    Exclude,
    Extract,
    Omit,
    Pick,
    Record,
}

/// Typescript utility type that uses one or two type arguments.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum UtilityType {
    T(UtilityTKind),
    KV(UtilityKVKind),
}
