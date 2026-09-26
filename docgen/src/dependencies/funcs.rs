use std::path::Path;

use oxc::{
    allocator::Allocator,
    ast::ast::{Declaration, ExportDefaultDeclarationKind, Expression, Statement},
    parser::Parser,
    span::SourceType,
};

use super::consts::{BOUNDARIES, TOKENS};

/// Excludes generated docs and non-script assets from the source graph.
pub(super) fn is_source_file(file: &Path) -> bool {
    !matches!(
        file.file_name().and_then(|name| name.to_str()),
        Some("docs.ts" | "docs.props.ts" | "docs.snippets.ts")
    ) && matches!(
        file.extension().and_then(|extension| extension.to_str()),
        Some("ts" | "mts" | "cts" | "js" | "mjs" | "cjs" | "svelte")
    )
}

/// Finds module imports even while a source edit is not valid TypeScript.
pub(super) fn scan_imports(source: &str) -> Vec<String> {
    let tokens = tokenize(source);
    let mut imports = Vec::new();
    let mut declaration = "";

    for (index, token) in tokens.iter().copied().enumerate() {
        let previous = index
            .checked_sub(1)
            .map(|index| tokens[index])
            .unwrap_or("");
        let before_previous = index
            .checked_sub(2)
            .map(|index| tokens[index])
            .unwrap_or("");
        let is_module_string = previous == "import"
            || (previous == "from" && !declaration.is_empty())
            || (previous == "("
                && (before_previous == "import"
                    || (before_previous == "require" && declaration == "import")));

        if is_module_string && let Some(value) = parse_string(token) {
            imports.push(value);
            declaration = "";
        }

        match token {
            "import" | "export" => declaration = token,
            ";" => declaration = "",
            _ => {}
        }
    }

    imports
}

/// Finds top-level props interfaces, falling back to tokens for incomplete edits.
pub(super) fn scan_interfaces(source: &str) -> Vec<String> {
    if !source.contains("interface") {
        return Vec::new();
    }

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, SourceType::ts()).parse();

    if !parsed.panicked {
        return parsed
            .program
            .body
            .iter()
            .filter_map(|statement| {
                let interface = match statement {
                    Statement::TSInterfaceDeclaration(interface) => interface,
                    Statement::ExportDeclaration(export) => match &export.declaration {
                        Declaration::TSInterfaceDeclaration(interface) => interface,
                        _ => return None,
                    },
                    Statement::ExportDefaultDeclaration(export) => match &export.declaration {
                        ExportDefaultDeclarationKind::TSInterfaceDeclaration(interface) => {
                            interface
                        }
                        _ => return None,
                    },
                    _ => return None,
                };
                interface
                    .id
                    .name
                    .strip_suffix("Props")
                    .filter(|name| !name.is_empty())
                    .map(str::to_owned)
            })
            .collect();
    }

    let tokens = tokenize(source);
    let mut interfaces = Vec::new();
    let mut depth: usize = 0;

    for pair in tokens.windows(2) {
        match pair[0] {
            "interface" if depth == 0 => {
                if let Some(name) = pair[1]
                    .strip_suffix("Props")
                    .filter(|name| !name.is_empty())
                {
                    interfaces.push(name.to_owned());
                }
            }
            "{" => depth += 1,
            "}" => depth = depth.saturating_sub(1),
            _ => {}
        }
    }

    interfaces
}

/// Decodes an import string, including an unfinished closing quote.
fn parse_string(token: &str) -> Option<String> {
    if !token.starts_with(['\'', '"', '`']) {
        return None;
    }

    let quote = token.chars().next()?;

    let allocator = Allocator::default();
    // The TypeScript preprocessor also reports imports whose closing quote is still being typed.
    let closing = if token.len() > 1 && token.ends_with(quote) {
        String::new()
    } else {
        quote.to_string()
    };
    let source = format!("({token}{closing})");
    let parsed = Parser::new(&allocator, &source, SourceType::ts()).parse();
    let Statement::ExpressionStatement(statement) = parsed.program.body.first()? else {
        return None;
    };

    match statement.expression.get_inner_expression() {
        Expression::StringLiteral(literal) => Some(literal.value.to_string()),
        Expression::TemplateLiteral(literal) if literal.expressions.is_empty() => literal
            .quasis
            .first()?
            .value
            .cooked
            .map(|value| value.to_string()),
        _ => None,
    }
}

/// Skips comments and literal text while retaining template expressions.
fn tokenize(source: &str) -> Vec<&str> {
    let mut tokens = Vec::new();
    let mut cursor = 0;
    let mut depth: usize = 0;
    let mut templates = Vec::new();

    while let Some(found) = TOKENS.find_at(source, cursor) {
        let token = found.as_str();
        cursor = found.end();

        if token.starts_with("//") || token.starts_with("/*") {
            continue;
        }

        if token == "`" {
            let (end, has_expression) = scan_template(source, cursor);
            cursor = end;

            if !has_expression {
                tokens.push(&source[found.start()..end]);
                continue;
            }

            templates.push(depth);
            depth += 1;
            tokens.push("{");
            continue;
        }

        tokens.push(token);

        match token {
            "{" => depth += 1,
            "}" => {
                depth = depth.saturating_sub(1);

                if templates.last() == Some(&depth) {
                    let (end, has_expression) = scan_template(source, cursor);
                    cursor = end;

                    if has_expression {
                        depth += 1;
                        tokens.push("{");
                    } else {
                        templates.pop();
                    }
                }
            }
            _ => {}
        }
    }

    tokens
}

/// Locates the next template expression or closing backtick.
fn scan_template(source: &str, start: usize) -> (usize, bool) {
    for boundary in BOUNDARIES.find_iter(&source[start..]) {
        if boundary.as_str() == "`" || boundary.as_str() == "${" {
            return (start + boundary.end(), boundary.as_str() == "${");
        }
    }

    (source.len(), false)
}
