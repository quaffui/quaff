import type { QComponentDocs } from "$docs";
import {
  QBadgeDocsProps,
  QBadgeDocsSnippets,
  QBadgeDocsDomAttributesConstraint,
  QBadgeDocsGenerics,
  QBadgeDocsTypeDependencies,
} from "./docs.props";

export const QBadgeDocs: QComponentDocs = {
  name: "QBadge",
  description: "Badges show notifications, counts, or short status labels alongside other content.",
  docs: {
    generics: QBadgeDocsGenerics,
    domAttributesConstraint: QBadgeDocsDomAttributesConstraint,
    props: QBadgeDocsProps,
    snippets: QBadgeDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QBadgeDocsTypeDependencies,
  },
};
