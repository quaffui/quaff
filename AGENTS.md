# Quaff Agent Notes

- Keep changes small and component-local. Do not stage unrelated work such as experimental components unless the task explicitly asks for it.
- Quaff is Svelte 5 only. Use runes-style component code (`$props`, `$state`, `$derived`, snippets) and avoid adding legacy Svelte 4 patterns.
- Use `bun run check` and `bun run build` for full validation. `bun run format` currently also sees untracked local files, so verify the worktree before trusting a format failure.
- Internal library code must not import components through `$lib` or the public package barrel. Use direct aliases such as `$components`, `$classes`, `$utils`, and `$internal`.
- Public package exports should stay intentionally small: root exports for convenience, `components/*` for direct component imports, `css/*` for built CSS, and documented plugins.
- Tree-shaking compatibility depends on internal imports staying direct and static. Avoid adding generated re-export chains or public-barrel imports inside `src/lib`.
- Component CSS entries live under `src/lib/css/components/*.scss` or `src/lib/css/shared/*.scss`; keep `src/lib/css/index.scss` as the full compatibility bundle and `src/lib/css/base.scss` as the shared base bundle.
- Shared component name/path/CSS strings live in `src/lib/internal/componentRegistry.ts`; update that file instead of duplicating string literals.
- When adding a component with CSS, add its CSS wrapper, add the CSS entry to `ComponentCss` in `src/lib/internal/componentRegistry.ts`, and add the public component and direct-import path dependencies to `ComponentCssDependencies` / `ComponentPathCssDependencies` in the same file. `vite.config.scss.ts` derives the CSS build entries from `ComponentCss`.
- `quaffCss()` in `src/lib/plugins/css.ts` should stay an app-level used-CSS plugin. Do not reintroduce per-module CSS injection; component dependency data belongs in `src/lib/internal/componentRegistry.ts`.
