import type { QComponentDocs } from "$docs";
import {
  QRangeDocsDomAttributesConstraint,
  QRangeDocsGenerics,
  QRangeDocsProps,
  QRangeDocsSnippets,
  QRangeDocsTypeDependencies,
  QSliderDocsDomAttributesConstraint,
  QSliderDocsGenerics,
  QSliderDocsProps,
  QSliderDocsSnippets,
  QSliderDocsTypeDependencies,
} from "./docs.props";

export const QSliderDocs: QComponentDocs = {
  name: "QSlider",
  description:
    "QSlider selects one value from a continuous or stepped range, with standard and centered Material 3 configurations.",
  docs: {
    generics: QSliderDocsGenerics,
    domAttributesConstraint: QSliderDocsDomAttributesConstraint,
    props: QSliderDocsProps,
    snippets: QSliderDocsSnippets,
    methods: [],
    events: [
      {
        name: "input",
        type: "(event: Event) => void",
        description: "Called immediately when the selected value changes.",
      },
      {
        name: "change",
        type: "(event: Event) => void",
        description: "Called when a completed value change is committed.",
      },
    ],
    typeDependencies: QSliderDocsTypeDependencies,
  },
};

export const QRangeDocs: QComponentDocs = {
  name: "QRange",
  description:
    "QRange selects a lower and upper value from the same range with two independently accessible handles.",
  docs: {
    generics: QRangeDocsGenerics,
    domAttributesConstraint: QRangeDocsDomAttributesConstraint,
    props: QRangeDocsProps,
    snippets: QRangeDocsSnippets,
    methods: [],
    events: [
      {
        name: "input",
        type: "(event: Event) => void",
        description: "Called immediately when either selected value changes.",
      },
      {
        name: "change",
        type: "(event: Event) => void",
        description: "Called when a completed range change is committed.",
      },
    ],
    typeDependencies: QRangeDocsTypeDependencies,
  },
};
