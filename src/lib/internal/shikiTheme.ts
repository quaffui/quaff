import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type SpecialLanguage,
  type ThemeRegistration,
} from "shiki";

function createQuaffShikiTheme(
  name: string,
  settings: NonNullable<ThemeRegistration["settings"]>
): ThemeRegistration {
  return {
    name,
    colors: {
      "editor.background": "var(--surface-container)",
      "editor.foreground": "var(--on-surface)",
    },
    settings: [
      {
        scope: [
          "comment",
          "punctuation.definition.comment",
          "string.comment",
          "markup.ignored",
          "markup.untracked",
        ],
        settings: {
          foreground: "var(--on-surface-variant)",
        },
      },
      {
        scope: [
          "constant",
          "support",
          "entity",
          "entity.name.constant",
          "markup.inline.raw",
          "meta.property-name",
          "meta.module-reference",
          "meta.diff.header",
          "meta.separator",
          "meta.output",
          "string-variable",
          "support.constant",
          "support.variable",
          "variable.other.constant",
          "variable.other.enummember",
          "variable.language",
        ],
        settings: {
          foreground: "var(--tertiary)",
        },
      },
      {
        scope: ["markup.heading", "markup.heading entity.name"],
        settings: {
          fontStyle: "bold",
          foreground: "var(--tertiary)",
        },
      },
      {
        scope: [
          "entity.name",
          "meta.export.default",
          "meta.definition.variable",
          "variable",
          "punctuation.definition.list.begin.markdown",
        ],
        settings: {
          foreground: "var(--primary)",
        },
      },
      {
        scope: [
          "constant.other.placeholder",
          "constant.character",
          "keyword",
          "storage",
          "storage.type",
          "punctuation.section.embedded",
        ],
        settings: {
          foreground: "var(--error)",
        },
      },
      {
        scope: [
          "string",
          "string punctuation.section.embedded source",
          "source.regexp",
          "string.regexp",
          "string.regexp.character-class",
          "string.regexp constant.character.escape",
          "string.regexp source.ruby.embedded",
          "string.regexp string.regexp.arbitrary-repitition",
          "constant.other.reference.link",
          "string.other.link",
        ],
        settings: {
          foreground: "var(--secondary)",
        },
      },
      ...settings,
    ],
  };
}

export const quaffShikiLightTheme = createQuaffShikiTheme("quaff-light", [
  {
    scope: ["entity.name.tag", "support.class.component"],
    settings: {
      foreground: "var(--color-green-8)",
    },
  },
]);

export const quaffShikiDarkTheme = createQuaffShikiTheme("quaff-dark", [
  {
    scope: ["entity.name.tag", "support.class.component"],
    settings: {
      foreground: "var(--color-green-5)",
    },
  },
]);

type QuaffShikiTheme = BundledTheme | ThemeRegistration;

let highlighterPromise: ReturnType<typeof createHighlighter> | undefined;
const languageLoads = new Map<string, Promise<void>>();
const themeLoads = new Map<string, Promise<void>>();

export async function getQuaffHighlighter(
  language: BundledLanguage | SpecialLanguage,
  theme: QuaffShikiTheme
) {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: [],
      themes: [quaffShikiLightTheme, quaffShikiDarkTheme],
    });
  }

  const highlighter = await highlighterPromise;
  const languageName = highlighter.resolveLangAlias(language);
  const themeName = typeof theme === "string" ? theme : theme.name;
  const pendingLoads: Promise<void>[] = [];

  if (!highlighter.getLoadedLanguages().includes(languageName)) {
    pendingLoads.push(
      loadOnce(languageLoads, languageName, () => highlighter.loadLanguage(language))
    );
  }

  if (themeName && !highlighter.getLoadedThemes().includes(themeName)) {
    pendingLoads.push(loadOnce(themeLoads, themeName, () => highlighter.loadTheme(theme)));
  }

  await Promise.all(pendingLoads);

  return highlighter;
}

async function loadOnce(
  cache: Map<string, Promise<void>>,
  name: string,
  load: () => Promise<void>
) {
  const pendingLoad = cache.get(name);

  if (pendingLoad) {
    await pendingLoad;
    return;
  }

  const loadPromise = load();
  cache.set(name, loadPromise);

  try {
    await loadPromise;
  } finally {
    cache.delete(name);
  }
}
