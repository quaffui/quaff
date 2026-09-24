# Quaff Agent Notes

- Keep changes small and component-local. Do not stage unrelated work such as experimental components unless the task explicitly asks for it.
- Keep every diff justified by the requested behavior: fix a reproduced bug, implement an explicitly requested feature, or make the code clearly simpler or faster. Avoid speculative changes and unrelated cleanup.
- Add a blank line before and after control-flow blocks such as `if`, `for`, `while`, `switch`, and `try`/`catch` when they sit next to other statements. Omit it when the block is first or last in its enclosing scope, and keep paired clauses such as `else`, `catch`, and `finally` together.
- Use `SCREAMING_SNAKE_CASE` for immutable constants, including fixed values, patterns and lookup tables. Keep runtime-derived locals and mutable state in `camelCase`; a `const` binding alone does not make an object immutable.
- Quaff is Svelte 5 only. Use runes-style component code (`$props`, `$state`, `$derived`, snippets) and avoid adding legacy Svelte 4 patterns.
- Use `bun run check` and `bun run build` for full validation. `bun run format` currently also sees untracked local files, so verify the worktree before trusting a format failure.
- Component API `docs.ts` files are generated and ignored by Git. Edit descriptions in Svelte `@component` comments and props in `props.ts`; run `bun run docgen-props` to regenerate descriptions, inherited defaults, snippets, and methods.
- Internal library code must not import components through `$lib` or the public package barrel. Use direct aliases such as `$components`, `$classes`, `$utils`, and `$internal`.
- Public package exports should stay intentionally small: root exports for convenience, `components/*` for direct component imports, `css/*` for built CSS, and documented plugins.
- Tree-shaking compatibility depends on internal imports staying direct and static. Avoid adding generated re-export chains or public-barrel imports inside `src/lib`.
- Component CSS entries live under `src/lib/css/components/*.scss` or `src/lib/css/shared/*.scss`; keep `src/lib/css/index.scss` as the full compatibility bundle and `src/lib/css/base.scss` as the shared base bundle.
- `src/lib/internal/componentRegistry.ts` defines component paths, CSS dependencies and cascade order. Update it when adding, moving or removing components, or changing their stylesheets, rendered children, helper classes (including dynamically built ones), or selector blocks.
- Add a CSS wrapper for each new stylesheet. Import maps, transitive dependencies and CSS build entries are derived from the registry; do not duplicate them. Preserve registry order unless intentionally changing the CSS cascade.
- `quaffCss()` in `src/lib/plugins/css.ts` should stay an app-level used-CSS plugin. Keep whole component stylesheets and the full base bundle by default; selector pruning requires `prune: true`. Do not reintroduce per-module CSS injection; component dependency data belongs in `src/lib/internal/componentRegistry.ts`.
