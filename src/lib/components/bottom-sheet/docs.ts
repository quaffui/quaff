import type { QComponentDocs } from "$docs";
import {
  QBottomSheetDocsProps,
  QBottomSheetDocsSnippets,
  QBottomSheetDocsMethods,
  QBottomSheetDocsDomAttributesConstraint,
  QBottomSheetDocsGenerics,
  QBottomSheetDocsTypeDependencies,
} from "./docs.props";

export const QBottomSheetDocs: QComponentDocs = {
  name: "QBottomSheet",
  description: "Bottom sheets show supporting content and actions at the bottom of a screen.",
  docs: {
    generics: QBottomSheetDocsGenerics,
    domAttributesConstraint: QBottomSheetDocsDomAttributesConstraint,
    props: QBottomSheetDocsProps,
    snippets: QBottomSheetDocsSnippets,
    methods: QBottomSheetDocsMethods,
    events: [],
    typeDependencies: QBottomSheetDocsTypeDependencies,
  },
};
