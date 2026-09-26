use super::Error;

#[test]
fn preserves_cli_diagnostics_for_messages_and_source_errors() {
    let message = Error::from("Invalid TypeScript source");
    assert_eq!(message.to_string(), "Invalid TypeScript source");
    assert_eq!(format!("{message:?}"), "\"Invalid TypeScript source\"");

    let source = std::io::Error::from(std::io::ErrorKind::PermissionDenied);
    let display = source.to_string();
    let debug = format!("{source:?}");
    let error = Error::from(source);
    assert_eq!(error.to_string(), display);
    assert_eq!(format!("{error:?}"), debug);

    let source = serde_json::from_str::<serde_json::Value>("{").unwrap_err();
    let display = source.to_string();
    let debug = format!("{source:?}");
    let error = Error::from(source);
    assert_eq!(error.to_string(), display);
    assert_eq!(format!("{error:?}"), debug);
}

#[test]
fn preserves_dependency_failure_diagnostics() {
    use crate::resolver::{DefinitionId, DefinitionKind, DependencyError};

    let error = Error::from(DependencyError::MissingDefinition {
        definition: DefinitionId::new("props.ts", 0, DefinitionKind::TypeAlias),
    });

    assert_eq!(
        error.to_string(),
        "No parsed TypeScript definition exists for DefinitionId { source: \"props.ts\", span_start: 0, kind: TypeAlias }"
    );
    assert_eq!(
        format!("{error:?}"),
        "MissingDefinition(DefinitionId { source: \"props.ts\", span_start: 0, kind: TypeAlias })"
    );
}
