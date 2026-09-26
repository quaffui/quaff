# Documentation generation

Run `bun run docgen-props` to generate component API docs, or pass a component directory such as `bun run docgen-props button`. The dev server also updates docs when their sources change.

Run `bun run docgen-clean` to remove generated API and snippet files, including legacy API outputs. Handwritten files are preserved. The next dev start or docs build regenerates them.

Rust discovers components, follows local imports and inherited component defaults, checks content hashes, and writes generated `docs.ts` files. Unchanged outputs keep their timestamps. Generation failures preserve the previous files; concurrent runs share an OS lock.

The small TypeScript adapter connects Rust to Vite's import resolver and Prettier. Prettier remains the only formatter, including for type definitions shown in API popups. Snippet extraction still uses the existing Svelte tooling. The TypeScript compiler API is used only as a test oracle for generated output.

The first run builds an optimized Rust executable; later runs reuse it. Component changes do not require rebuilding Rust. Changes to generator sources, dependencies or formatting configuration invalidate the documentation cache.

Keep generator logic independent of specific Quaff component props. Follow [AGENTS.md](../../AGENTS.md), preserve generated metadata and cache behavior, and compare cold, cached and incremental runs when changing this pipeline.
