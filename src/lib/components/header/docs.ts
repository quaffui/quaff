import type { QComponentDocs } from "$docs";
import {
  QHeaderDocsProps,
  QHeaderDocsSnippets,
  QHeaderDocsDomAttributesConstraint,
  QHeaderDocsGenerics,
  QHeaderDocsTypeDependencies,
} from "./docs.props";

export const QHeaderDocs: QComponentDocs = {
  name: "QHeader",
  description:
    "QHeader is a component used for the top section of a QLayout, typically containing a QToolbarTitle for titles, navigation, and actions. It can be configured to be elevated, bordered, reveal on scroll, and have a custom height.",
  docs: {
    generics: QHeaderDocsGenerics,
    domAttributesConstraint: QHeaderDocsDomAttributesConstraint,
    props: QHeaderDocsProps,
    snippets: QHeaderDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QHeaderDocsTypeDependencies,
  },
};
