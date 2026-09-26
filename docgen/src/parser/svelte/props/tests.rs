use std::{collections::HashMap, path::Path};

use oxc::ast::ast::BindingProperty;

use crate::{
    Result,
    parser::{ParseSource, SvelteParser},
    resolver::PathResolver,
};

#[test]
fn preserves_defaults_without_a_resolvable_initializer() -> Result<()> {
    let resolver = PathResolver(Path::new("/virtual/Fixture.svelte"));
    let mut props = HashMap::new();
    r#"
        import { importedDefault } from "fixture-package";
        declare const declaredDefault: string;
        const localDefault = "local";
        let {
            nan = NaN,
            infinity = Infinity,
            empty = undefined,
            imported = importedDefault,
            declared = declaredDefault,
            local = localDefault,
            bound = $bindable(localDefault),
            computed = createDefault(),
            unset,
        } = $props();
    "#
    .to_string()
    .parse_source(|node, semantic| {
        if let Some(mut bindings) = <&[BindingProperty]>::extract(node) {
            props.extend(bindings.parse(semantic, &resolver)?);
        }

        Ok(false)
    })?;

    for (name, expected) in [
        ("nan", "NaN"),
        ("infinity", "Infinity"),
        ("empty", "undefined"),
        ("imported", "importedDefault"),
        ("declared", "declaredDefault"),
        ("local", "\"local\""),
        ("bound", "localDefault"),
        ("computed", "createDefault()"),
    ] {
        assert_eq!(props[name].default.as_deref(), Some(expected), "{name}");
    }

    assert!(props["bound"].bindable);
    assert!(props["unset"].default.is_none());
    Ok(())
}
