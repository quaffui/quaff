# Quaff Agent Notes

- Keep changes small and component-local. Do not stage unrelated work such as experimental components unless the task explicitly asks for it.
- Avoid nested ternaries; use clear branches or a lookup instead.
- Use `!!value` instead of `Boolean(value)` for truthiness casts.
- Name functions and methods with a verb describing the action, such as `readCachedFont` or `collectIconUsage`. Boolean predicates should start with `is`, `has`, `does`, `can`, or `should`, such as `doesFileExist`. Keep names required by external APIs (for example Vite hooks).
- Use `async`/`await` and `try`/`catch`/`finally` for asynchronous control flow. Avoid `.then()`, `.catch()`, `.finally()`, and `.error()` callback chains. Keep an external API call only when there is no appropriate async/await alternative, and explain the reason briefly. Error-reporting calls such as Vite's `logger.error()` are external logging APIs, not asynchronous control flow.
- Give intermediate values descriptive names and use explicit branches when an expression combines selection, imports, and asynchronous work. For example:

  ```ts
  let processedRecords = records;

  if (requestedIds) {
    const selectedIds = [...requestedIds];
    const { processRecords } = await import("./processRecords.js");
    processedRecords = await processRecords(records, selectedIds);
  }
  ```

- Avoid deeply nested loops and conditionals. Use guard clauses and extract a coherent operation into a named helper: for example, call `addAvailableCandidates(names, usage.candidates, availableNames)` once per usage instead of nesting candidate iteration and matching inside the outer loop. Do not add helpers that merely rename a single obvious expression.
- Use filenames that describe their contents, such as `componentStyles.ts` or `fontAssetStore.ts`, rather than vague names such as `selection.ts` or `files.ts`. Combine repeated passes over the same collection when one pass expresses the operation clearly.
- Keep every diff justified by the requested behavior: fix a reproduced bug, implement an explicitly requested feature, or make the code clearly simpler or faster. Avoid speculative changes and unrelated cleanup.
- Add a blank line before and after control-flow blocks such as `if`, `for`, `while`, `switch`, and `try`/`catch` when they sit next to other statements. Omit it when the block is first or last in its enclosing scope, and keep paired clauses such as `else`, `catch`, and `finally` together.
- Keep typography relative and design geometry stable. Read [Sizing and text scaling](docs/development/sizing.md) before changing component sizing; it defines the unit policy, official M3 sources, and checks to preserve text scaling.
- Use `SCREAMING_SNAKE_CASE` for immutable constants, including fixed values, patterns and lookup tables. Keep runtime-derived locals and mutable state in `camelCase`; a `const` binding alone does not make an object immutable.
- Quaff is Svelte 5 only. Use runes-style component code (`$props`, `$state`, `$derived`, snippets) and avoid adding legacy Svelte 4 patterns.
- Use `bun run check` and `bun run build` for full validation. `bun run format` currently also sees untracked local files, so verify the worktree before trusting a format failure.
- Component API `docs.ts` files are generated and ignored by Git. Edit descriptions in Svelte `@component` comments and props in `props.ts`; run `bun run docgen-props` to regenerate descriptions, inherited defaults, snippets, and methods.
- Use `q-docs-link` for docs prose hyperlinks so they share theme color, underline, and keyboard focus styles. Keep component and demo navigation links on their own styles.
- Use the preprocessed `Q.classes()` for declarative BEM styling. It keeps markup clean by stripping `Q.classes("q-<name>", ...)` from `<script>` at compile time and rewriting the matching element's `class="q-<name>"` into a compiled class array. Target elements must have `class="q-<name>"` as an exact single text literal in template markup; do not add extra classes to the element directly. Pass modifier flags in `bemClasses` (e.g. `{ dense, [size]: true }` to produce `q-<name>--dense` or dynamic `q-<name>--${size}`) and un-prefixed classes in `classes` (e.g. `[props.class]` or `() => derivedVal` arrow functions). Multiple `Q.classes()` calls can target different sub-elements in the same component.
- Use `QContext` to share reactive state across component boundaries (e.g. compound components). Plain objects passed to Svelte contexts lose reactivity in Svelte 5; the preprocessor automatically rewrites `myContext.set({ ... })` object literals into reactive getters and setters at compile time. Define an interface ending in `Context` (e.g. `interface ButtonGroupContext`) in the component file inside `<script module lang="ts">`, create the context with `export const myCtx = QContext<MyContext>("QName")`, mark immutable members `readonly` to omit setters, and pass all interface properties to `myCtx.set({ ... })`. If the interface name, property names, or property counts mismatch, the preprocessor warns and falls back to a non-reactive context.
- Preprocessors in `plugins/` compile to `plugins/dist` and are consumed by `svelte.config.js`. When editing code in `plugins/`, run `bun run gen:plugins` (or `tsc -p plugins/tsconfig.json`) to rebuild them before running `bun run check`, `bun run build`, or `bun run dev`.
- Internal library code must not import components through `$lib` or the public package barrel. Use direct aliases such as `$components`, `$classes`, `$utils`, and `$internal`.
- Public package exports should stay intentionally small: root exports for convenience, `components/*` for direct component imports, `css/*` for built CSS, and documented plugins.
- Tree-shaking compatibility depends on internal imports staying direct and static. Avoid adding generated re-export chains or public-barrel imports inside `src/lib`.
- Component CSS entries live under `src/lib/css/components/*.scss` or `src/lib/css/shared/*.scss`; keep `src/lib/css/index.scss` as the full compatibility bundle and `src/lib/css/base.scss` as the shared base bundle.
- `src/lib/internal/componentRegistry.ts` defines component paths, CSS dependencies and cascade order. Update it when adding, moving or removing components, or changing their stylesheets, rendered children, helper classes (including dynamically built ones), or selector blocks.
- Add a CSS wrapper for each new stylesheet. Import maps, transitive dependencies and CSS build entries are derived from the registry; do not duplicate them. Preserve registry order unless intentionally changing the CSS cascade.
- `quaffAssets()` in `src/lib/plugins/assets.ts` manages app-level CSS and optional font optimization through shared source usage. Keep whole component stylesheets and the full base bundle by default; selector stripping requires `css.stripUnused: true`. `plugins/css.ts` only reports the migration from `quaffCss()`; do not maintain its old behavior. Keep implementations grouped under `plugins/assets`; do not reintroduce per-module CSS injection or duplicate the component registry.
