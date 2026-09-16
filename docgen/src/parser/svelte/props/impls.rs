use std::collections::HashMap;

use oxc::ast::{
    AstKind,
    ast::{BindingPattern, BindingProperty, Expression, PropertyKey, VariableDeclarator},
};
use oxc_semantic::{AstNode, Semantic};

use crate::{
    Result, SpanDisplay,
    parser::svelte::{props::ParsedSvelteProp, traits::SvelteParser},
    resolver::{PathResolver, ReferenceResolver, ResolvedReference},
};

use super::ParsedSvelteProps;

impl<'a> SvelteParser<'a> for &'a [BindingProperty<'a>] {
    type Output = Result<ParsedSvelteProps>;

    fn extract(node: &'a AstNode) -> Option<Self> {
        if let AstKind::VariableDeclarator(VariableDeclarator { id, init, .. }) = node.kind()
            && let Some(expr) = init
            && let Expression::CallExpression(call_expr) = expr
            && call_expr.callee_name() == Some("$props")
            && let BindingPattern::ObjectPattern(pattern) = id
        {
            return Some(&pattern.properties);
        }

        None
    }

    fn parse(&mut self, semantic: &Semantic, resolver: &PathResolver) -> Self::Output {
        let mut res: ParsedSvelteProps = HashMap::new();

        for prop in self.iter() {
            if let PropertyKey::StaticIdentifier(id) = &prop.key {
                let name = id.name.to_string();
                let mut parsed = ParsedSvelteProp::default();

                match &prop.value {
                    BindingPattern::BindingIdentifier(_) => {}
                    BindingPattern::AssignmentPattern(pattern) => match &pattern.right {
                        Expression::CallExpression(expr) => {
                            if expr.callee_name() == Some("$bindable") {
                                // Case: const { name = $bindable(...) } = $props();
                                // => The prop is bindable and the default is the first argument (if any)
                                parsed.default =
                                    SpanDisplay::display_option(expr.arguments.first(), semantic);
                                parsed.bindable = true;
                            } else {
                                // Case: const { name = someFunction() } = $props();
                                // => The default is the function call, we don't try to resolve it (maybe TODO later)
                                parsed.default = Some(expr.display(semantic));
                            }
                        }
                        Expression::Identifier(ident) => {
                            // Case: const { name = myVariable } = $props(); where myVariable is an Identifier
                            let mut init = None;

                            ident.resolve(semantic, resolver, &mut |resolved, _| {
                                let ResolvedReference::VariableDeclarator(decl, sem) = resolved
                                else {
                                    return Ok(());
                                };
                                init = SpanDisplay::display_option(decl.init.as_ref(), sem);

                                Ok(())
                            })?;

                            parsed.default = init.or_else(|| Some(ident.display(semantic)));
                        }
                        _ => {
                            // Case: const { name = ... } = $props(); where ... is neither an Identifier nor a "$bindable" CallExpression
                            parsed.default = Some(pattern.right.display(semantic));
                        }
                    },
                    _ => {
                        return Err(format!(
                            "Unsupported $props binding pattern for {name}: {:#?}",
                            prop.value
                        )
                        .into());
                    }
                }

                res.insert(name, parsed);
            }
        }

        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use crate::parser::source::ParseSource;

    use super::*;

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
}
