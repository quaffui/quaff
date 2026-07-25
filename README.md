# Quaff

<img src="./static/logo.svg" alt="Quaff cocktail logo" width="112" align="left" />

Quaff is a Material Design 3 framework built for Svelte 5. It includes ready-to-use
components, layouts, and utilities for building Svelte apps.

[Documentation](https://quaff.dev/) · [Components](https://quaff.dev/components) ·
[npm](https://www.npmjs.com/package/@quaffui/quaff)

<br clear="left" />

```sh
npm create quaff@latest
```

> [!NOTE]
> Quaff is in beta while we prepare `1.0.0-rc1`. Most of the framework is in place, but some
> APIs may still change before 1.0.

## Included

- Material Design 3 components, layouts, and themes
- Built for Svelte 5 runes and SvelteKit
- Fully typed component APIs
- Easy setup, auto-imports, and component tree shaking through `create-quaff`

## Getting Started

`create-quaff` creates a new SvelteKit project with Quaff configured. Once it finishes, open the generated project and start building your app.

Browse the [documentation](https://quaff.dev/) for components, layouts, and utilities.

## Contributing to Quaff

To work on the framework itself, install its dependencies and start the dev server:

```sh
bun install
bun run dev
```

Common commands:

- `bun run open` starts the development server and opens it in a browser
- `bun run check` runs Svelte and TypeScript diagnostics
- `bun run lint` checks formatting and lint rules
- `bun run package` builds and validates the publishable Svelte package
- `bun run build` builds the package and its CSS bundles
- `bun run build:docs` generates and builds the documentation site

## Repository Layout

- `src/lib/components` contains the public UI components
- `src/lib/css` contains component styles, themes, and layout utilities
- `src/routes` contains the documentation and component examples
- `plugins` contains the build-time preprocessors and CSS integration
- `docgen` and `scripts` contain documentation and build tooling

## Acknowledgements

Quaff began with code and ideas from several open-source projects and still maintains some
compatible APIs. Most of that code has since been replaced with Quaff's own implementation:

- [Quasar Framework](https://quasar.dev/): Copyright (c) 2015-present Razvan Stoenescu.
  Licensed under the [MIT License](https://github.com/quasarframework/quasar/blob/dev/LICENSE)
- [Material Web](https://github.com/material-components/material-web): Copyright (c) Google
  LLC. Licensed under the
  [Apache License 2.0](https://github.com/material-components/material-web/blob/main/LICENSE)
- [BeerCSS](https://www.beercss.com/): Copyright (c) 2021 Beer css! Licensed under the
  [MIT License](https://github.com/beercss/beercss/blob/main/LICENSE)

Quaff is independent and is not endorsed by or affiliated with Google, Material Design, or
the projects listed.

## License

Quaff is available under the [MIT License](./LICENSE).
