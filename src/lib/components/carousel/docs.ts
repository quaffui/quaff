import type { QComponentDocs } from "$docs";
import {
  QCarouselDocsDomAttributesConstraint,
  QCarouselDocsGenerics,
  QCarouselDocsProps,
  QCarouselDocsSnippets,
  QCarouselDocsTypeDependencies,
} from "./docs.props";

export const QCarouselDocs: QComponentDocs = {
  name: "QCarousel",
  description:
    "Browse visual collections with responsive Material 3 carousels, keyboard navigation, and accessible controls.",
  docs: {
    generics: QCarouselDocsGenerics,
    domAttributesConstraint: QCarouselDocsDomAttributesConstraint,
    props: QCarouselDocsProps,
    snippets: QCarouselDocsSnippets,
    methods: [],
    events: [
      {
        name: "change",
        type: "(event: Event) => void",
        description: "Called when navigation or completed scrolling changes the prominent item.",
      },
    ],
    typeDependencies: QCarouselDocsTypeDependencies,
  },
};
