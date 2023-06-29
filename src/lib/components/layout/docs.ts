import type { QComponentDocs } from "$utils/types";
import { QLayoutDocsProps } from "./docs.props";

export let QLayoutDocs: QComponentDocs = {
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