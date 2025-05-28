<script lang="ts">
  import { assets } from "$app/paths";
  import { QIconDocs } from "$components/icon/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QIcon } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";
</script>

<svelte:head>
  <title>{pageTitle("QIcon")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QIconDocs}>
  {#snippet display()}
    <QIcon name="check" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default Usage (Material Symbols)">
        {#snippet sectionDescription()}
          Use the <code>name</code> prop to display any icon from the Material Symbols library. By default,
          icons use the "outlined" style.
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon name="home" />
          <QIcon name="settings" />
          <QIcon name="favorite" />
          <QIcon name="delete" />
        </div>
      </QDocsSection>

      <QDocsSection title="Icon Types">
        {#snippet sectionDescription()}
          Material Symbols come in three types: <code>outlined</code> (default),
          <code>rounded</code>, and <code>sharp</code>. Use the <code>type</code> prop to switch between
          them.
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon name="table" type="outlined" />
          <span>Outlined (Default)</span>
        </div>
        <div class="flex q-gap-lg items-center q-mt-sm">
          <QIcon name="table" type="rounded" />
          <span>Rounded</span>
        </div>
        <div class="flex q-gap-lg items-center q-mt-sm">
          <QIcon name="table" type="sharp" />
          <span>Sharp</span>
        </div>
      </QDocsSection>

      <QDocsSection title="Icon Sizes">
        {#snippet sectionDescription()}
          Control the icon size using the <code>size</code> prop. It accepts predefined sizes (<code
            >xs</code
          >,
          <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>), numbers (interpreted
          as pixels), or any valid CSS size value (e.g., "3rem", "2em").
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon name="check" size="xs" />
          <QIcon name="check" size="sm" />
          <QIcon name="check" size="md" />
          <QIcon name="check" size="lg" />
          <QIcon name="check" size="xl" />
          <QIcon name="check" size={48} />
          <QIcon name="check" size="3rem" />
        </div>
      </QDocsSection>

      <QDocsSection title="Filled Icons">
        {#snippet sectionDescription()}
          Set the <code>filled</code> prop to true to use the filled style of Material Symbols.
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon name="settings" />
          <span>Default</span>
          <QIcon name="settings" filled />
          <span>Filled</span>
          <QIcon name="person" />
          <span>Default</span>
          <QIcon name="person" filled />
          <span>Filled</span>
        </div>
      </QDocsSection>

      <QDocsSection title="Coloring Icons">
        {#snippet sectionDescription()}
          Use the <code>color</code> prop to apply theme colors or standard CSS colors. You can also
          use utility classes like <code>text-primary</code>, <code>text-red-5</code> (see
          <a class="text-primary" href="/colors">the colors page</a> for a list of available colors),
          etc.
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon name="thumb_up" color="primary" />
          <QIcon name="thumb_up" color="tertiary" />
          <QIcon name="thumb_up" color="green" />
          <QIcon name="thumb_up" color="#ff5722" />
          <QIcon name="thumb_up" class="text-amber-4" />
        </div>
      </QDocsSection>

      <QDocsSection title="Using Images">
        {#snippet sectionDescription()}
          Display an image instead of a font icon using the <code>img</code> prop. Provide the image
          URL. You can pass additional attributes to the underlying <code>&lt;img&gt;</code> tag via
          <code>imgAttributes</code>, such as <code>alt</code> text.
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon img="{assets}/cocktail.jpg" size="lg" />
          <QIcon
            img="{assets}/cocktail.jpg"
            size="xl"
            imgAttributes={{ alt: "A delicious cocktail", style: "border-radius: 50%;" }}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Using SVG">
        {#snippet sectionDescription()}
          You can render custom SVG content in two ways:
          <ol class="q-pl-lg q-my-sm">
            <li>Pass SVG content directly via the default slot.</li>
            <li>
              Pass an SVG string via the <code>svg</code> prop (Note: Current component
              implementation might need adjustment to render the <code>svg</code> prop content
              correctly using <code>@html</code>).
            </li>
          </ol>
        {/snippet}
        <!-- Example SVG content -->
        {@const exampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`}

        <!-- Method 1: Default Slot -->
        <div class="flex column q-gap-lg">
          <div class="flex q-gap-sm items-center">
            <QIcon size="lg" color="primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </QIcon>
            <span>SVG via Slot</span>
          </div>

          <!-- Method 2: svg prop -->
          <div class="flex q-gap-sm items-center">
            <QIcon size="lg" color="error" svg={exampleSvg} />
            <span>SVG via Prop</span>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          Icons are often decorative. If an icon conveys meaning or is interactive, ensure it's
          accessible.
          <ul class="q-pl-lg q-my-sm">
            <li>
              For purely decorative icons, add <code>aria-hidden="true"</code>.
            </li>
            <li>
              If the icon is the only content of an interactive element (like a button), provide an
              <code>aria-label</code> on the button describing the action (e.g.,
              <code
                >&lt;QBtn aria-label="Settings"&gt;&lt;QIcon name="settings" aria-hidden="true"
                /&gt;&lt;/QBtn&gt;</code
              >).
            </li>
            <li>
              If the icon itself conveys information not otherwise present, consider adding an
              <code>aria-label</code> directly to the icon or using visually hidden text.
            </li>
          </ul>
          The<code>QIcon</code> component renders an <code>&lt;i&gt;</code> tag. You can pass ARIA attributes
          directly.
        {/snippet}
        <div class="flex q-gap-lg items-center">
          <QIcon name="visibility_off" aria-hidden="true" />
          <span>Decorative Icon (aria-hidden)</span>
          <QIcon name="info" role="img" aria-label="Information" />
          <span>Informative Icon (aria-label)</span>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
