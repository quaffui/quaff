<script lang="ts">
  import { QCodeBlock } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import { pageTitle } from "$helpers/pageTitle";
</script>

<svelte:head>
  <title>{pageTitle("CSS Tree Shaking")}</title>
</svelte:head>

<QDocs
  docName="CSS Tree Shaking"
  docDescription="Include the styles your components need, with optional selector pruning."
>
  {#snippet display()}
    <QCodeBlock language="ts" code="quaffCss()" />
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Setup and Defaults" noCode>
      {#snippet sectionDescription()}
        <p>
          <code>quaffCss()</code> keeps all base and helper CSS plus the complete stylesheets for used
          components and their dependencies. It does not prune individual selectors. This default applies
          in development and production. Whole-package dynamic imports and wildcard re-exports keep all
          component styles.
        </p>
        <p>
          <code>create-quaff</code> includes the plugin when auto-import is enabled. Otherwise, add
          <code>quaffCss()</code> to your existing Vite plugins, keeping the others:
        </p>
      {/snippet}

      <QCodeBlock
        title="vite.config.ts"
        language="ts"
        code={`import { quaffCss } from "@quaffui/quaff/plugins/css";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [quaffCss(), sveltekit()],
});`}
        copiable
      />
      <p class="q-mt-md">
        The plugin adds <code>virtual:quaff.css</code> to <code>src/routes/+layout.svelte</code>
        automatically. Remove any existing <code>@quaffui/quaff/css/index.css</code> import there to enable
        tree shaking.
      </p>
    </QDocsSection>

    <QDocsSection title="Optional Selector Pruning" noCode>
      {#snippet sectionDescription()}
        <p>
          Set <code>prune: true</code> to remove unused selectors from base and helper CSS. Used
          component stylesheets stay complete. Check your app's runtime states after enabling it:
          dynamically built class names can lose their CSS. For example,
          <code>{'class={"q-pa-" + size}'}</code>
          needs
          <code>/^q-pa-/</code> in the safelist.
        </p>
      {/snippet}

      <QCodeBlock
        language="ts"
        code={`quaffCss({
  prune: true,
  safelist: ["text-primary", /^q-pa-/],
});`}
        copiable
      />
      <p class="q-mt-md">
        <code>safelist</code> accepts strings and regular expressions, or a PurgeCSS object with
        <code>standard</code>, <code>deep</code>, and <code>greedy</code> lists.
      </p>
    </QDocsSection>

    <QDocsSection title="External Components and Fallbacks" noCode>
      {#snippet sectionDescription()}
        <p>
          The plugin scans <code>sourceDir</code>, which defaults to <code>src</code>. For
          components or <code>Notify</code> used by a workspace package or dependency outside that
          directory, add their export names to <code>include</code>. This works with or without
          pruning:
        </p>
      {/snippet}

      <QCodeBlock language="ts" code={'quaffCss({ include: ["QBtn", "Notify"] });'} copiable />
      <p class="q-my-md">
        Set <code>dev: "full"</code> to use the full stylesheet during development. To opt out in
        both development and production, add this import to your root layout's script, replacing
        <code>virtual:quaff.css</code> if you imported it manually:
      </p>
      <QCodeBlock language="ts" code="import &quot;@quaffui/quaff/css/index.css&quot;;" copiable />
      <p class="q-mt-md">
        When using <code>vite build --watch</code>, restart after adding unimported source files.
        The dev server detects them automatically.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>
