use std::collections::HashMap;

use oxc::ast::ast::{BindingPattern, BindingProperty, Expression, PropertyKey};
use oxc_semantic::Semantic;

use crate::{
    defs::{ParsedDefault, ParsedDefaults, PathResolver, ResolvedReference},
    prelude::{Result, SpanDisplay, W},
    resolver::resolve_reference,
};

pub fn parse_defaults(
    props: &[BindingProperty],
    semantic: &Semantic,
    paths_mapper: &PathResolver,
) -> Result<ParsedDefaults> {
    let mut res: ParsedDefaults = HashMap::new();

    for prop in props {
        if let PropertyKey::StaticIdentifier(id) = &prop.key {
            let name = id.name.to_string();

            match &prop.value {
                BindingPattern::BindingIdentifier(_) => {
                    // Case: const { name } = $props();
                    // => The prop has no default
                    res.insert(name, ParsedDefault::Value(None));
                }
                BindingPattern::AssignmentPattern(pattern) => match &pattern.right {
                    Expression::CallExpression(expr) => {
                        if expr.callee_name() == Some("$bindable") {
                            // Case: const { name = $bindable(...) } = $props();
                            // => The prop is bindable and the default is the first argument (if any)
                            let default =
                                SpanDisplay::display_option(expr.arguments.first(), semantic);
                            res.insert(name, ParsedDefault::Bindable(default));
                        } else {
                            // Case: const { name = someFunction() } = $props();
                            // => The default is the function call, we don't try to resolve it (maybe TODO later)
                            let default = expr.display(semantic);
                            res.insert(name, ParsedDefault::Value(Some(default)));
                        }
                    }
                    Expression::Identifier(ident) => {
                        // Case: const { name = myVariable } = $props(); where myVariable is an Identifier
                        let mut init = None;

                        resolve_reference(ident, semantic, paths_mapper, |resolved| {
                            let ResolvedReference::VariableDeclarator(decl, sem) = resolved else {
                                return Ok(());
                            };
                            init = SpanDisplay::display_option(decl.init.as_ref(), sem);

                            Ok(())
                        })?;

                        res.insert(name, ParsedDefault::Value(init));
                    }
                    _ => {
                        // Case: const { name = ... } = $props(); where ... is neither an Identifier nor a "$bindable" CallExpression
                        let default = pattern.right.display(semantic);
                        res.insert(name, ParsedDefault::Value(Some(default)));
                    }
                },
                _ => {
                    println!("{:#?}", prop.value);
                }
            }
        }
    }

    Ok(res)
}
