use crate::parser::ParsedType;

/// Matches a primitive type through resolved references.
pub(super) fn is_standard_type(parsed: &ParsedType, expected: &str) -> bool {
    match parsed {
        ParsedType::Standard(standard) => standard.name == expected,
        ParsedType::Reference(reference) => is_standard_type(&reference.parsed, expected),
        _ => false,
    }
}

/// Checks whether this type is understood well enough to filter `undefined` safely.
pub(super) fn can_remove_undefined(parsed: &ParsedType) -> bool {
    match parsed {
        ParsedType::Standard(standard) => {
            matches!(
                standard.name.as_str(),
                "undefined"
                    | "never"
                    | "string"
                    | "number"
                    | "boolean"
                    | "bigint"
                    | "symbol"
                    | "object"
                    | "null"
                    | "true"
                    | "false"
            ) || standard.name.starts_with(['"', '\''])
                || standard.name.parse::<f64>().is_ok()
        }
        ParsedType::Reference(reference) => is_definitely_defined(&reference.parsed),
        ParsedType::Union(types) => types.iter().all(can_remove_undefined),
        _ => is_definitely_defined(parsed),
    }
}

/// Reports whether a resolved type excludes `undefined`.
fn is_definitely_defined(parsed: &ParsedType) -> bool {
    match parsed {
        ParsedType::Reference(reference) => is_definitely_defined(&reference.parsed),
        ParsedType::Union(types) => types.iter().all(is_definitely_defined),
        ParsedType::Standard(standard) => {
            standard.name != "undefined" && can_remove_undefined(parsed)
        }
        ParsedType::TemplateLiteral(_)
        | ParsedType::TypeLiteral(_)
        | ParsedType::Interface(_)
        | ParsedType::Function(_)
        | ParsedType::Tuple(_) => true,
        _ => false,
    }
}

/// Removes empty union alternatives and collapses a single surviving member.
pub(super) fn filter_undefined_or_never(parsed: ParsedType) -> Option<ParsedType> {
    if parsed.is_undefined_or_never() {
        return None;
    }

    if let ParsedType::Union(types) = parsed {
        let mut filtered: Vec<ParsedType> = types
            .into_iter()
            .filter_map(filter_undefined_or_never)
            .collect();

        if filtered.is_empty() {
            return None;
        }

        if filtered.len() == 1 {
            return Some(filtered.remove(0));
        }

        return Some(ParsedType::Union(filtered));
    }

    Some(parsed)
}
