use std::collections::HashMap;

use oxc::ast::{
    AstKind,
    ast::{BindingPattern, BindingProperty, Expression, PropertyKey, VariableDeclarator},
};
use oxc_semantic::{AstNode, Semantic};

use crate::{
    Result, SpanDisplay,
    parser::{ParsedSvelteProp, SvelteParser},
    resolver::{PathResolver, ReferenceResolver, ResolvedReference},
};

use super::ParsedSvelteProps;

impl<'a> SvelteParser<'a> for &'a [BindingProperty<'a>] {
    type Output = Result<ParsedSvelteProps>;

    /// Selects destructured bindings from a `$props()` declaration.
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

    /// Resolves default expressions and records `$bindable()` declarations.
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
