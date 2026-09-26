/// TypeScript operator precedence used to add only the parentheses required for valid output.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum TsPrecedence {
    Conditional,
    Function,
    Union,
    Intersection,
    TypeOperator,
    Array,
    IndexedAccess,
    Primary,
}
