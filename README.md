# Quaff

Quaff is a component library for Svelte that follows the [Material Design 3](https://m3.material.io/) guidelines. It provides a comprehensive set of UI components designed to create beautiful, consistent, and accessible web applications.

> **⚠️ Early Development Notice:** Quaff is still maturing and not battle-tested yet. Use it in production if you're feeling brave! We welcome contributions and feedback to help shape the library.

## Overview

Quaff is project that draws some inspiration from [Quasar Framework](https://quasar.dev/), [Material Web](https://material-web.dev/) and [BeerCSS](https://www.beercss.com/) adapted specifically for Svelte 5. It implements Material Design 3 (Material You) principles while providing a developer-friendly API.
This is an independent project and is not endorsed by or affiliated with Material Design 3 or Quasar Framework.

Key features:

- Built for [Svelte 5](https://svelte.dev/) and [SvelteKit](https://kit.svelte.dev/) with full runes support
- Follows Material Design 3 guidelines
- Type-safe components with TypeScript
- Comprehensive component documentation
- Components auto-import out of the box

## Getting started

Quaff comes with a CLI tool called `create-quaff`. You can use it to easily create a new Quaff project:

```bash
bun create quaff@latest
```

## Developing

Once you've installed dependencies with `bun install`, start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run open
```

Everything inside `src/lib` is part of the library, everything inside `src/routes` serves as documentation and component showcase.

## Building

To build the library:

```bash
bun run package
```

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy the documentation site, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Project Structure

- `/src/lib/components` - The individual UI components
- `/src/lib/css` - Styling and theming utilities
- `/src/routes` - Documentation and examples
- `/docgen` - Documentation generation tools

## Acknowledgements

This project draws inspiration from:

- [Quasar Framework](https://quasar.dev/): Copyright (c) 2015-present Razvan Stoenescu. Licensed under the [MIT License](https://github.com/quasarframework/quasar/blob/dev/LICENSE)
- [Material Web Components](https://github.com/material-components/material-web): Copyright (c) Google LLC. Licensed under the [Apache License 2.0 License](https://github.com/material-components/material-web/blob/main/LICENSE)
- [BeerCSS](https://www.beercss.com/): Copyright (c) 2021 Beer css! Licensed under the [MIT License](https://github.com/beercss/beercss/blob/main/LICENSE)

## License

MIT
