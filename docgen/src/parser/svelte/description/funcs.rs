use std::{fs::read_to_string, path::Path};

use oxc::{allocator::Allocator, parser::Parser, span::SourceType};

use crate::Result;

use super::consts::{SCRIPT_END, STYLE_END};

/// Reads the markdown description from a Svelte `@component` comment.
pub fn parse_component_description(svelte_file: &Path) -> Result<Option<String>> {
    Ok(component_description(&read_to_string(svelte_file)?).map(str::to_owned))
}

/// Finds the first nonempty component comment outside markup and expressions.
pub(super) fn component_description(content: &str) -> Option<&str> {
    let bytes = content.as_bytes();
    let mut cursor = 0;

    while cursor < bytes.len() {
        if bytes[cursor..].starts_with(b"<!--") {
            let start = cursor + 4;
            let end = start + content[start..].find("-->")?;
            let comment = content[start..end].trim_start();

            if let Some(description) = comment.strip_prefix("@component")
                && description.starts_with(char::is_whitespace)
                && !description.trim().is_empty()
            {
                return Some(description.trim());
            }

            cursor = end + 3;
        } else if bytes[cursor] == b'{' {
            cursor = skip_expression(bytes, cursor);
        } else if bytes[cursor] == b'<'
            && bytes.get(cursor + 1).is_some_and(|next| {
                next.is_ascii_alphabetic()
                    || (*next == b'/' && bytes.get(cursor + 2).is_some_and(u8::is_ascii_alphabetic))
            })
        {
            let start = cursor + 1;
            cursor += 1;

            while cursor < bytes.len() && bytes[cursor] != b'>' {
                cursor = match bytes[cursor] {
                    b'{' => skip_expression(bytes, cursor),
                    b'\'' | b'"' => skip_quoted(bytes, cursor, true),
                    _ => cursor + 1,
                };
            }

            cursor = (cursor + 1).min(bytes.len());
            let tag = content[start..cursor]
                .split([' ', '\t', '\r', '\n', '>'])
                .next();
            let closing = match tag {
                Some("script") => Some(&*SCRIPT_END),
                Some("style") => Some(&*STYLE_END),
                _ => None,
            };

            if let Some(closing) = closing {
                cursor = closing
                    .find(&content[cursor..])
                    .map_or(bytes.len(), |matched| cursor + matched.end());
            }
        } else {
            cursor += 1;
        }
    }

    None
}

/// Skips a Svelte expression while respecting strings, comments, and nested braces.
///
/// Consuming attribute expressions also prevents `=>` from ending the surrounding tag.
fn skip_expression(source: &[u8], start: usize) -> usize {
    let content = std::str::from_utf8(&source[start + 1..]).unwrap();
    let expression = content.trim_start();
    let is_block = expression.starts_with(['#', ':', '@'])
        || expression.strip_prefix('/').is_some_and(|closing| {
            closing.split('}').next().is_some_and(|name| {
                name.trim()
                    .chars()
                    .all(|letter| letter.is_ascii_alphabetic())
            })
        });

    // Let the existing TypeScript parser recognize expression boundaries, including regex
    // literals containing braces. Svelte block directives use the balanced scanner below.
    if !is_block {
        let allocator = Allocator::default();

        for (end, _) in content.match_indices('}') {
            if Parser::new(&allocator, &content[..end], SourceType::ts())
                .parse_expression()
                .is_ok()
            {
                return start + end + 2;
            }
        }
    }

    let mut cursor = start + 1;
    let mut depth = 1;

    while cursor < source.len() {
        match source[cursor] {
            b'\'' | b'"' | b'`' => cursor = skip_quoted(source, cursor, false),
            b'/' if source.get(cursor + 1) == Some(&b'/') => {
                cursor += 2;

                while cursor < source.len() && !matches!(source[cursor], b'\r' | b'\n') {
                    cursor += 1;
                }
            }
            b'/' if source.get(cursor + 1) == Some(&b'*') => {
                cursor += 2;
                cursor = source[cursor..]
                    .windows(2)
                    .position(|pair| pair == b"*/")
                    .map_or(source.len(), |end| cursor + end + 2);
            }
            b'{' => {
                depth += 1;
                cursor += 1;
            }
            b'}' => {
                depth -= 1;
                cursor += 1;

                if depth == 0 {
                    return cursor;
                }
            }
            _ => cursor += 1,
        }
    }

    cursor
}

/// Skips quoted text, handling escapes and embedded expressions for its context.
fn skip_quoted(source: &[u8], start: usize, attribute: bool) -> usize {
    let quote = source[start];
    let mut cursor = start + 1;

    while cursor < source.len() {
        if source[cursor] == quote {
            return cursor + 1;
        } else if source[cursor] == b'\\' && !attribute {
            cursor = (cursor + 2).min(source.len());
        } else if source[cursor] == b'{' && attribute {
            cursor = skip_expression(source, cursor);
        } else if quote == b'`' && source[cursor] == b'$' && source.get(cursor + 1) == Some(&b'{') {
            cursor = skip_expression(source, cursor + 1);
        } else {
            cursor += 1;
        }
    }

    cursor
}
