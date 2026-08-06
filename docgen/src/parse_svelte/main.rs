use std::{collections::HashMap, path::Path};

use oxc::ast::{
    AstKind,
    ast::{
        BindingPattern, BindingProperty, Declaration, ExportDeclaration, Expression, Function,
        VariableDeclarator,
    },
};
use oxc_semantic::AstNode;

use crate::{
    defs::{ParsedDefaults, PathResolver},
    parse_svelte::defaults::parse_defaults,
    parser::parse_svelte_ts,
    prelude::*,
};

pub fn parse_svelte_file(svelte_file: &Path) -> Result<ParsedDefaults> {
    let mut defaults = HashMap::default();
    let paths_mapper = PathResolver(svelte_file);

    parse_svelte_ts(svelte_file, |node, semantic, _program| {
        if let Some(props) = get_props(node) {
            defaults.extend(parse_defaults(props, semantic, &paths_mapper)?);
        } else if let Some(func) = get_methods(node) {
            println!("Name: {:?}", func.name());
            println!("Params: {:#?}", func.params.items);
            println!("Return Type: {:#?}", func.return_type);
        }

        Ok(false)
    })?;

    Ok(defaults)
}

fn get_props<'a>(node: &'a AstNode) -> Option<&'a [BindingProperty<'a>]> {
    if let AstKind::VariableDeclarator(VariableDeclarator { id, init, .. }) = node.kind() {
        if let Some(expr) = init
            && let Expression::CallExpression(call_expr) = expr
            && call_expr.callee_name() == Some("$props")
        {
            if let BindingPattern::ObjectPattern(pattern) = id {
                return Some(&pattern.properties);
            }
        }
    }

    None
}

fn get_methods<'a>(node: &'a AstNode) -> Option<&'a Function<'a>> {
    if let AstKind::ExportDeclaration(ExportDeclaration { declaration, .. }) = node.kind()
        && let Declaration::FunctionDeclaration(func) = declaration
    {
        return Some(func);
    }

    None
}
