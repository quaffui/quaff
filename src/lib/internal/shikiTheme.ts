import { createHighlighter, type ThemeRegistration } from "shiki";

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

const quaffShikiLightTheme = createQuaffShikiTheme("quaff-light", [
  {
    scope: ["entity.name.tag", "support.class.component"],
    settings: {
      foreground: "var(--color-green-8)",
    },
  },
]);

const quaffShikiDarkTheme = createQuaffShikiTheme("quaff-dark", [
  {
    scope: ["entity.name.tag", "support.class.component"],
    settings: {
      foreground: "var(--color-green-5)",
    },
  },
]);

export async function createQuaffHighlighter(
  langs: Parameters<typeof createHighlighter>[0]["langs"],
  themes: Parameters<typeof createHighlighter>[0]["themes"] = []
) {
  return await createHighlighter({
    langs,
    themes: [quaffShikiLightTheme, quaffShikiDarkTheme, ...themes],
  });
}

export const quaffTsHighlighter = await createQuaffHighlighter(["typescript"]);
