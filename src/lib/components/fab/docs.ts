import type { QComponentDocs } from "$docs";
import {
  QExtendedFabDocsDomAttributesConstraint,
  QExtendedFabDocsGenerics,
  QExtendedFabDocsProps,
  QExtendedFabDocsSnippets,
  QExtendedFabDocsTypeDependencies,
  QFabDocsDomAttributesConstraint,
  QFabDocsGenerics,
  QFabDocsProps,
  QFabDocsSnippets,
  QFabDocsTypeDependencies,
  QFabMenuDocsDomAttributesConstraint,
  QFabMenuDocsGenerics,
  QFabMenuDocsProps,
  QFabMenuDocsSnippets,
  QFabMenuDocsTypeDependencies,
} from "./docs.props";

export const QFabDocs: QComponentDocs = {
  name: "QFab",
  description: "Present the primary action with an icon-only Material 3 floating action button.",
  docs: {
    generics: QFabDocsGenerics,
    domAttributesConstraint: QFabDocsDomAttributesConstraint,
    props: QFabDocsProps,
    snippets: QFabDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(event: MouseEvent) => void",
        description: "Called when the primary action is activated.",
      },
    ],
    typeDependencies: QFabDocsTypeDependencies,
  },
};

export const QExtendedFabDocs: QComponentDocs = {
  name: "QExtendedFab",
  description:
    "Name the primary action with a label and an optional icon, and collapse when needed.",
  docs: {
    generics: QExtendedFabDocsGenerics,
    domAttributesConstraint: QExtendedFabDocsDomAttributesConstraint,
    props: QExtendedFabDocsProps,
    snippets: QExtendedFabDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(event: MouseEvent) => void",
        description: "Called when the primary action is activated.",
      },
    ],
    typeDependencies: QExtendedFabDocsTypeDependencies,
  },
};

export const QFabMenuDocs: QComponentDocs = {
  name: "QFabMenu",
  description: "Open a menu of related actions from a floating action button.",
  docs: {
    generics: QFabMenuDocsGenerics,
    domAttributesConstraint: QFabMenuDocsDomAttributesConstraint,
    props: QFabMenuDocsProps,
    snippets: QFabMenuDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QFabMenuDocsTypeDependencies,
  },
};
