import type { QComponentDocs } from "$lib/utils";
import { QLayoutDocsProps } from "./docs.props";

export const QLayoutDocs: QComponentDocs = {
  name: "QLayout",
  description:
    "The QLayout component is designed to be the skeleton of the entire page, with navigational elements such as header, railbars, drawers and footer. This component is not mandatory but it really helps structure the page.",
  docs: {
    props: QLayoutDocsProps,
    slots: [],
    methods: [],
    events: [],
  },
};
