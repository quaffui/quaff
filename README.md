# Quaff

Quaff is an experimental project utilizing [Beer CSS](https://www.beercss.com/) and parts of [Quasar Framework](https://quasar.dev/) as the base for Svelte components. This independent project is not endorsed by or affiliated with Beer CSS or Quasar Framework.

**This is merely a playground right now, don't expect anything usable!**

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of the library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build the library:

```bash
npm run package
```

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Third-party Libraries

This project makes use of the following open source libraries:

- [Beer CSS](https://www.beercss.com/): Copyright (c) 2021 Beer css!. Licensed under the [MIT License](https://github.com/beercss/beercss/blob/main/LICENSE)
- [Quasar Framework](https://quasar.dev/): Copyright (c) 2015-present Razvan Stoenescu. Licensed under the [MIT License](https://github.com/quasarframework/quasar/blob/dev/LICENSE)
