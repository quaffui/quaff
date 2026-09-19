<script lang="ts">
  import { QBtn, QCard, QCodeBlock, QInput } from "$lib";
  import { useMeta } from "$lib/meta";
  import { QDocs, QDocsSection } from "$docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { setupExample, pageExample } from "./examples";

  const defaultDescription = "Manage page titles and SEO metadata with Quaff.";
  let title = $state("Meta");
  let description = $state(defaultDescription);

  useMeta(() => ({
    title: title || "Meta",
    meta: {
      description: { name: "description", content: description },
    },
  }));

  function reset() {
    title = "Meta";
    description = defaultDescription;
  }
</script>

<QDocs
  docName="Meta"
  docDescription="Manage page titles, descriptions, and links with reactive metadata."
>
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
          Wrap your app in one <code>QMeta</code> and pass shared defaults through
          <code>metadata</code>. In SvelteKit, use the root layout.
        </p>
        <p>
          The <code>@quaffui/quaff/meta</code> import works with Svelte and SvelteKit, needs no plugin,
          and supports tree shaking.
        </p>
      {/snippet}

      <QCodeBlock language="svelte" code={setupExample} copiable />
    </QDocsSection>

    <QDocsSection title="Page Metadata" noCode>
      {#snippet sectionDescription()}
        <p>
          Call <code>useMeta</code> in a child component's script. Pass an object for fixed values or
          a getter for reactive values. The inputs above update this page's title and description.
        </p>
      {/snippet}

      <QCodeBlock language="svelte" code={pageExample} copiable />
    </QDocsSection>

    <QDocsSection title="Metadata Fields" noCode>
      {#snippet sectionDescription()}
        <ul class="q-ml-md">
          <li><code>title</code>: Page title.</li>
          <li><code>titleTemplate</code>: Function that formats the title.</li>
          <li>
            <code>meta</code>: Keyed meta attributes, with an optional
            <code>template: (content) =&gt; string</code> to format each tag's content.
          </li>
          <li>
            <code>link</code>: Keyed link attributes, such as <code>rel</code> and
            <code>href</code>.
          </li>
        </ul>
      {/snippet}
    </QDocsSection>

    <QDocsSection title="Defaults and Cleanup" noCode>
      {#snippet sectionDescription()}
        <p>
          For tags with the same key, the last registered component wins. Removing it restores
          earlier values. Set a tag to <code>null</code> to remove it:
          <code>{"meta: { description: null }"}</code>.
        </p>
        <p>
          Keep fixed tags like charset and viewport in your app template. Avoid duplicating managed
          tags in <code>svelte:head</code>.
        </p>
      {/snippet}
    </QDocsSection>

    <QDocsSection title="Rendering and SEO" noCode>
      {#snippet sectionDescription()}
        <p>
          SSR and prerendering include metadata in the page HTML. SPAs update it after JavaScript
          runs, which some crawlers and social previews won't see.
        </p>
        <p>
          Load SEO data before rendering, for example through SvelteKit's <code>load</code>. For
          awaited data in experimental async components, use native <code>svelte:head</code>.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>
