use oxc::ast::ast::{TSInterfaceDeclaration, TSTypeAliasDeclaration, VariableDeclarator};
use oxc_semantic::Semantic;

/// An enum of AstKind variants that can be resolved from a reference.
pub enum ResolvedReference<'a> {
    /// A reference to a variable declarator.
    VariableDeclarator(&'a VariableDeclarator<'a>, &'a Semantic<'a>),
    /// A reference to a type alias declaration.
    TSTypeAliasDeclaration(&'a TSTypeAliasDeclaration<'a>, &'a Semantic<'a>),
    /// A reference to an interface declaration.
    TSInterfaceDeclaration(&'a TSInterfaceDeclaration<'a>, &'a Semantic<'a>),
}
