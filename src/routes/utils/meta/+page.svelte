<script lang="ts">
  import { QBtn, QCard, QCodeBlock, QInput } from "$lib";
  import { useMeta } from "$lib/meta";
  import { QDocs, QDocsSection } from "$docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { setupExample, pageExample } from "./examples";

  const DEFAULT_DESCRIPTION = "Manage page titles and descriptions with Quaff.";
  let title = $state("Meta");
  let description = $state(DEFAULT_DESCRIPTION);

  useMeta(() => ({
    title: title || "Meta",
    meta: {
      description: { name: "description", content: description },
    },
  }));

  function reset() {
    title = "Meta";
    description = DEFAULT_DESCRIPTION;
  }
</script>

<QDocs docName="Meta" docDescription="Set page titles, descriptions, and links.">
  {#snippet display()}
    <QCard class="flex column q-gap-md q-pa-md" style="width: 100%; max-width: 28rem;">
      <QInput label="Page title" bind:value={title} outlined />
      <QInput label="Description" bind:value={description} outlined />
      <div aria-live="polite">
        <strong>{pageTitle(title || "Meta")}</strong>
        <p>{description}</p>
      </div>
      <QBtn label="Reset metadata" variant="flat" onclick={reset} />
    </QCard>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Setup" noCode>
      {#snippet sectionDescription()}
        <p>
          Call <code>initMeta</code> in your root component's script. In SvelteKit, use the root layout.
          Pass any shared defaults here.
        </p>
        <p>
          Place <code>QMetaHead</code> after your page content so SSR includes its metadata.
        </p>
      {/snippet}

      <QCodeBlock language="svelte" code={setupExample} copiable />
    </QDocsSection>

    <QDocsSection title="Page Metadata" noCode>
      {#snippet sectionDescription()}
        Call <code>useMeta</code> in a child component's script. Pass an object for fixed values or a
        getter for reactive values.
      {/snippet}

      <QCodeBlock language="svelte" code={pageExample} copiable />
    </QDocsSection>

    <QDocsSection title="Defaults and Options" noCode>
      {#snippet sectionDescription()}
        <p>
          For each key, the last registered value wins. Removing a component restores earlier
          values. Set a tag to <code>null</code>
          to remove it: <code>{"meta: { description: null }"}</code>.
        </p>
        <ul class="q-ml-md">
          <li><code>titleTemplate</code>: Function that formats the title.</li>
          <li>
            <code>meta</code>: Meta tags by key. Each value holds HTML attributes and an optional
            <code>template</code> function to format its content.
          </li>
          <li><code>link</code>: Link tags by key, such as a canonical URL.</li>
        </ul>
      {/snippet}
    </QDocsSection>

    <QDocsSection title="Server Rendering" noCode>
      {#snippet sectionDescription()}
        <p>
          SSR and prerendering include metadata in the HTML. Load data before rendering, for example
          with SvelteKit's <code>load</code>. For awaited metadata in experimental async components,
          use native
          <code>svelte:head</code>.
        </p>
        <p>
          Keep charset and viewport in your app template. Avoid duplicating managed tags in
          <code>svelte:head</code>.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>
