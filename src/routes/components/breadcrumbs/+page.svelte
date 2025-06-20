<script lang="ts">
  import { QBreadcrumbsDocs } from "$components/breadcrumbs/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBreadcrumbs, QBreadcrumbsEl } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";
</script>

<svelte:head>
  <title>{pageTitle("QBreadcrumbs")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QBreadcrumbsDocs}>
  {#snippet display()}
    <QBreadcrumbs>
      <QBreadcrumbsEl to="/" label="Home" />
      <QBreadcrumbsEl to="/components" label="Components" />
      <QBreadcrumbsEl label="Breadcrumbs" />
    </QBreadcrumbs>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          <p>
            Breadcrumbs provide navigation links for the current page location. The last item is
            automatically styled as active using the default
            <code>activeColor</code> which is <code>primary</code>.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            <QBreadcrumbsEl to="/" label="Home" />
            <QBreadcrumbsEl to="/components" label="Components" />
            <QBreadcrumbsEl label="Breadcrumbs" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Separators">
        {#snippet sectionDescription()}
          <p>
            You can customize the separator between breadcrumbs using the <code>separator</code>
            prop. By default, the separator is a <code>/</code> (slash) character. You can use a
            text character or prefix with <code>icon:</code> to use a Material Symbol icon.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs separator=">">
            <QBreadcrumbsEl to="/" label="Home" />
            <QBreadcrumbsEl to="/components" label="Components" />
            <QBreadcrumbsEl label="Breadcrumbs" />
          </QBreadcrumbs>
        </div>
        <div class="q-mb-md">
          <QBreadcrumbs separator="icon:chevron_right">
            <QBreadcrumbsEl to="/" label="Home" />
            <QBreadcrumbsEl to="/components" label="Components" />
            <QBreadcrumbsEl label="Breadcrumbs" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Separator Using Snippet">
        {#snippet sectionDescription()}
          <p>
            For more complex separators, you can use the <code>separator</code> snippet to provide custom
            markup. This gives you complete control over the separator's appearance.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            {#snippet separator()}
              <span class="text-red">•••</span>
            {/snippet}

            <QBreadcrumbsEl to="/" label="Home" />
            <QBreadcrumbsEl to="/components" label="Components" />
            <QBreadcrumbsEl label="Breadcrumbs" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Colors">
        {#snippet sectionDescription()}
          <p>
            Customize the active item color and separator color using the <code>activeColor</code>
            and
            <code>separatorColor</code> props. These accept any color from your theme.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs
            activeColor="error-container"
            separatorColor="green"
            separator="icon:chevron_right"
          >
            <QBreadcrumbsEl to="/" label="Home" />
            <QBreadcrumbsEl to="/components" label="Components" />
            <QBreadcrumbsEl label="Breadcrumbs" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="With Icons">
        {#snippet sectionDescription()}
          <p>
            Add icons to breadcrumb items using the <code>icon</code> prop to display Material Symbols
            icons. Icons appear before the item label.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            <QBreadcrumbsEl to="/" label="Home" icon="home" />
            <QBreadcrumbsEl to="/components" label="Components" icon="widgets" />
            <QBreadcrumbsEl label="Breadcrumbs" icon="list_alt" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Icon Using Snippet">
        {#snippet sectionDescription()}
          <p>
            For more complex icons or custom styling, you can use a Svelte snippet for the <code
              >icon</code
            > prop.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            <QBreadcrumbsEl to="/" label="Home">
              {#snippet icon()}
                <span>🏠</span>
              {/snippet}
            </QBreadcrumbsEl>
            <QBreadcrumbsEl to="/components" label="Components" />
            <QBreadcrumbsEl label="Breadcrumbs" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Gutter Sizes">
        {#snippet sectionDescription()}
          <p>
            Adjust the spacing around separators using the <code>gutter</code> prop. Available
            options are <code>sm</code> (default), <code>md</code>, and <code>lg</code>.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs gutter="sm">
            <QBreadcrumbsEl label="Small" />
            <QBreadcrumbsEl label="Gutter" />
          </QBreadcrumbs>
        </div>
        <div class="q-mb-md">
          <QBreadcrumbs gutter="md">
            <QBreadcrumbsEl label="Medium" />
            <QBreadcrumbsEl label="Gutter" />
          </QBreadcrumbs>
        </div>
        <div class="q-mb-md">
          <QBreadcrumbs gutter="lg">
            <QBreadcrumbsEl label="Large" />
            <QBreadcrumbsEl label="Gutter" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Content">
        {#snippet sectionDescription()}
          <p>
            Instead of using the <code>label</code> prop, you can provide custom content using the default
            slot. This allows for more complex markup and styling inside each breadcrumb element.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            <QBreadcrumbsEl to="/">
              {#snippet icon()}
                <span>🏠</span>
              {/snippet}

              <span class="font-bold">Home</span>
            </QBreadcrumbsEl>
            <QBreadcrumbsEl to="/components">
              <span class="text-green">Components</span>
            </QBreadcrumbsEl>
            <QBreadcrumbsEl>
              <span>Breadcrumbs</span>
            </QBreadcrumbsEl>
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Navigation">
        {#snippet sectionDescription()}
          <p>
            Breadcrumb elements become navigational links when you add the <code>to</code> or
            <code>href</code>
            prop. The <code>to</code> prop is typically used with your router, while
            <code>href</code> can be used for standard hyperlinks or anchor links, although you can use
            them interchangeably.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            <QBreadcrumbsEl to="/" label="Router Link" />
            <QBreadcrumbsEl href="#navigation" label="Anchor Link" />
            <QBreadcrumbsEl label="Non-navigational" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Element Tag">
        {#snippet sectionDescription()}
          <p>
            By default, non-navigational breadcrumb elements use a <code>span</code> tag. You can
            change this using the <code>tag</code> prop.
          </p>
        {/snippet}
        <div class="q-mb-md">
          <QBreadcrumbs>
            <QBreadcrumbsEl to="/" label="Link Element (a)" />
            <QBreadcrumbsEl tag="div" label="Div Element" />
            <QBreadcrumbsEl label="Span Element (default)" />
          </QBreadcrumbs>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
