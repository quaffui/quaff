<script lang="ts">
  import { QSeparatorHorizontalDocs, QSeparatorVerticalDocs } from "$components/separator/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QCard, QCardSection, QSeparator } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";
</script>

<svelte:head>
  <title>{pageTitle("QSeparator")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={[QSeparatorHorizontalDocs, QSeparatorVerticalDocs]}>
  {#snippet display()}
    <div>Me</div>
    <QSeparator text="My procrastination" spacing="lg" />
    <div>My projects</div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Horizontal Separator">
        {#snippet sectionDescription()}
          QSeparator is used to create visual divisions between content. By default, it creates a
          horizontal line that spans the width of its container.
        {/snippet}

        <div class="q-my-md text-center">
          <p>Content above the separator</p>
          <QSeparator />
          <p>Content below the separator</p>
        </div>
      </QDocsSection>

      <QDocsSection title="Vertical Separator">
        {#snippet sectionDescription()}
          Use the <code>vertical</code> prop to create a separator that runs vertically. This is useful
          for creating column divisions in a horizontal layout.
        {/snippet}

        <div class="flex flex-center q-gap-md q-my-md" style="height: 100px;">
          <div>Left content</div>
          <QSeparator vertical />
          <div>Center content</div>
          <QSeparator vertical />
          <div>Right content</div>
        </div>
      </QDocsSection>

      <QDocsSection title="Separator with Text">
        {#snippet sectionDescription()}
          Add text to a separator using the <code>text</code> prop. This creates a visual break with
          a label, which can be useful for section headings or to provide context.
        {/snippet}

        <div class="q-my-md text-center">
          <QSeparator text="Section Heading" />
          <p class="q-mt-md">Content in this section</p>
        </div>
      </QDocsSection>

      <QDocsSection title="Text Alignment">
        {#snippet sectionDescription()}
          Control the placement of text with the <code>textAlign</code> prop. For horizontal separators,
          options are "left", "center" (default), or "right". For vertical separators, options are "top",
          "middle" (default), or "bottom".
        {/snippet}

        <div class="q-my-md">
          <QSeparator text="Left Aligned Text" textAlign="left" />
          <div class="q-my-md"></div>
          <QSeparator text="Centered Text (Default)" />
          <div class="q-my-md"></div>
          <QSeparator text="Right Aligned Text" textAlign="right" />
        </div>

        <div class="flex items-center justify-center q-my-md" style="height: 200px;">
          <QSeparator vertical text="Top" textAlign="top" class="q-mx-md" />
          <QSeparator vertical text="Middle (Default)" class="q-mx-md" />
          <QSeparator vertical text="Bottom" textAlign="bottom" class="q-mx-md" />
        </div>
      </QDocsSection>

      <QDocsSection title="Spacing">
        {#snippet sectionDescription()}
          Adjust the margin around the separator with the <code>spacing</code> prop. Options include
          "none" (default), "xs", "sm", "md", "lg", and "xl".
        {/snippet}

        <div class="q-my-md">
          <QSeparator text="No Spacing (Default)" spacing="none" />
          <QSeparator text="XS Spacing" spacing="xs" />
          <QSeparator text="SM Spacing" spacing="sm" />
          <QSeparator text="MD Spacing" spacing="md" />
          <QSeparator text="LG Spacing" spacing="lg" />
          <QSeparator text="XL Spacing" spacing="xl" />
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Color">
        {#snippet sectionDescription()}
          Customize the color of the separator line with the <code>color</code> prop. You can use any
          color name from your theme or a custom CSS color.
        {/snippet}

        <div class="q-my-md">
          <QSeparator text="Default Color (outline)" />
          <QSeparator text="Primary Color" color="primary" class="q-my-md" />
          <QSeparator text="Secondary Color" color="secondary" class="q-my-md" />
          <QSeparator text="Error Color" color="error" class="q-my-md" />
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Size (Thickness) - Not supported yet">
        {#snippet sectionDescription()}
          Control the thickness of the separator line with the <code>size</code> prop. This accepts any
          valid CSS size value.
        {/snippet}

        <div class="q-my-md">
          <QSeparator text="Default Size" />
          <QSeparator text="2px Thick" size="2px" class="q-my-md" />
          <QSeparator text="3px Thick" size="3px" class="q-my-md" />
          <QSeparator text="5px Thick" size="5px" class="q-my-md" />
        </div>
      </QDocsSection>

      <QDocsSection title="Inset Separator">
        {#snippet sectionDescription()}
          The <code>inset</code> prop adds padding to the separator's container, creating space around
          the separator. This is useful when you want to visually indent the separator.
        {/snippet}

        <div class="q-my-md" style="border: 1px dashed var(--outline); padding: 1rem;">
          <p>Container with border</p>
          <QSeparator text="Normal Separator" />
          <div class="q-my-md"></div>
          <QSeparator text="Inset Separator" inset />
        </div>
      </QDocsSection>

      <QDocsSection title="Use in Cards">
        {#snippet sectionDescription()}
          Separators are especially useful in cards to divide different sections of content.
        {/snippet}

        <QCard class="q-ma-md" style="max-width: 350px;">
          <QCardSection>
            <h6 class="q-my-none">Card Title</h6>
            <p>This is the primary content of the card.</p>
          </QCardSection>

          <QSeparator />

          <QCardSection>
            <p>This is a secondary section of content.</p>
          </QCardSection>

          <QSeparator text="Additional Information" />

          <QCardSection>
            <p>Here is some additional information about this card.</p>
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Decorative Separators">
        {#snippet sectionDescription()}
          Separators can be used decoratively to add visual interest to a page, especially when
          combined with text and custom styling.
        {/snippet}

        <div class="q-pa-md">
          <h5 class="text-center q-mb-lg">Page Section</h5>

          <QSeparator text="★ Featured Content ★" color="secondary" size="2px" spacing="lg" />

          <p class="text-center q-mt-lg">This section is highlighted with a decorative separator</p>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility Considerations" noCode>
        {#snippet sectionDescription()}
          QSeparator includes appropriate ARIA attributes (<code>aria-orientation</code>) to ensure
          good accessibility. Separators with text act as visual headings but don't replace semantic
          heading elements (h1-h6) for screen readers.
        {/snippet}

        <div class="q-pa-md">
          <h6>Accessibility Best Practices</h6>
          <ul>
            <li>Use separators with text to complement, not replace, proper heading elements</li>
            <li>Ensure sufficient color contrast when customizing separator colors</li>
            <li>
              When using vertical separators, consider alternative visual cues for smaller screens
            </li>
          </ul>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
