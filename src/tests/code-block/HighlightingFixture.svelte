<script lang="ts">
  import QApi from "#docs/QApi.svelte";
  import { docsCtx } from "#docs/QDocs.svelte";
  import QDocsSection from "#docs/QDocsSection.svelte";
  import type { QComponentDocs } from "#docs/types.js";
  import Quaff from "#classes/Quaff.svelte.js";

  const DOCS: QComponentDocs = {
    name: "Example",
    description: "Highlighting fixture",
    docs: {
      generics: [],
      domAttributesConstraint: undefined,
      props: [
        {
          name: "size",
          header: '<span data-quaff data-type-name="Size" tabindex="0">Size</span>',
          description: "Choose a size.",
        },
      ],
      snippets: [],
      methods: [{ name: "show", header: "show()", description: "Show the example." }],
      typeDependencies: { Size: 'type Size = "small" | "large";' },
    },
  };
  const SNIPPETS = { Example: '<QBtn label="Example" />' };

  docsCtx.set({ componentDocs: DOCS, snippets: SNIPPETS });
</script>

<button onclick={() => Quaff.darkMode.toggle()}>Toggle theme</button>
<QApi />
<QDocsSection title="Example">Visible example</QDocsSection>
