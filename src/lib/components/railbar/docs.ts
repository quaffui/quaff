import type { QComponentDocs } from "$docs";
import {
  QRailbarDocsProps,
  QRailbarDocsSnippets,
  QRailbarDocsDomAttributesConstraint,
  QRailbarDocsGenerics,
  QRailbarDocsTypeDependencies,
} from "./docs.props";

export const QRailbarDocs: QComponentDocs = {
  name: "QRailbar",
  description:
    "Railbars are used to provide navigation between different sections or views within an application.",
  docs: {
    generics: QRailbarDocsGenerics,
    domAttributesConstraint: QRailbarDocsDomAttributesConstraint,
    props: QRailbarDocsProps,
    snippets: QRailbarDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QRailbarDocsTypeDependencies,
  },
};
