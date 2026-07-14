<script lang="ts">
  import { QIconBtnDocs } from "$components/button/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QIconBtn } from "$lib";
  import { QDocs, QDocsSection } from "$docs";

  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QIconBtnDocs });
</script>

<svelte:head>
  <title>{pageTitle("QIconBtn")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QIconBtn icon="star" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default Icon Buttons">
        {#snippet sectionDescription()}
          QIconBtn is a button component that displays only an icon. It's built on top of QBtn and
          inherits most of its features and properties.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="favorite" />
        <QIconBtn class="q-ma-sm" icon="search" />
        <QIconBtn class="q-ma-sm" icon="share" />
      </QDocsSection>

      <QDocsSection title="Width Options">
        {#snippet sectionDescription()}
          Expressive icon buttons support narrow, default, and wide widths using the
          <code>width</code> prop.
        {/snippet}

        <QIconBtn class="q-ma-sm" expressive icon="favorite" width="narrow" />
        <QIconBtn class="q-ma-sm" expressive icon="favorite" width="default" />
        <QIconBtn class="q-ma-sm" expressive icon="favorite" width="wide" />
      </QDocsSection>

      <QDocsSection title="Loading State">
        {#snippet sectionDescription()}
          Icon buttons can display a loading indicator. When the loading prop is true, a circular
          progress indicator replaces the icon.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="refresh" loading />
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Disabled icon buttons indicate that an action is unavailable. They maintain their
          appearance but don't respond to user interaction.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="add" disabled />
        <QIconBtn
          class="q-ma-sm"
          icon="close"
          disabled
          onclick={() => alert("What's this sorcery?!")}
        />
      </QDocsSection>

      <QDocsSection title="Button Variants">
        {#snippet sectionDescription()}
          QIconBtn supports multiple variants to match your design needs. You can specify variants
          using the <code>variant</code> prop.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="star" />
        <QIconBtn class="q-ma-sm" icon="star" unelevated />
        <QIconBtn class="q-ma-sm" icon="star" variant="filled" />
        <QIconBtn class="q-ma-sm" icon="star" variant="tonal" />
        <QIconBtn class="q-ma-sm" icon="star" variant="outlined" />
        <QIconBtn class="q-ma-sm" icon="star" variant="flat" />
      </QDocsSection>

      <QDocsSection title="Button Variants Using Boolean Props">
        {#snippet sectionDescription()}
          As an alternative to the <code>variant</code> prop, you can use boolean props to set the button
          variant.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="star" />
        <QIconBtn class="q-ma-sm" icon="star" unelevated />
        <QIconBtn class="q-ma-sm" icon="star" filled />
        <QIconBtn class="q-ma-sm" icon="star" tonal />
        <QIconBtn class="q-ma-sm" icon="star" outlined />
        <QIconBtn class="q-ma-sm" icon="star" flat />
      </QDocsSection>

      <QDocsSection title="Size">
        {#snippet sectionDescription()}
          Standard icon buttons support sm, md (default), lg, and xl sizes.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="star" size="sm" unelevated />
        <QIconBtn class="q-ma-sm" icon="star" unelevated />
        <QIconBtn class="q-ma-sm" icon="star" size="lg" unelevated />
        <QIconBtn class="q-ma-sm" icon="star" size="xl" unelevated />
      </QDocsSection>

      <QDocsSection title="Expressive Icon Buttons">
        {#snippet sectionDescription()}
          Enable <code>expressive</code> for one button, or pass
          <code>{`{ expressive: true }`}</code>
          to <code>Quaff.init()</code> to use the Material 3 Expressive styles globally.
        {/snippet}

        <QIconBtn class="q-ma-sm" expressive icon="star" size="xs" filled />
        <QIconBtn class="q-ma-sm" expressive icon="star" filled />
        <QIconBtn class="q-ma-sm" expressive icon="star" size="md" filled />
        <QIconBtn
          class="q-ma-sm"
          expressive
          icon="star"
          size="md"
          width="wide"
          shape="squared"
          tonal
        />
      </QDocsSection>

      <QDocsSection title="Button with Router Link">
        {#snippet sectionDescription()}
          Icon buttons can function as navigation links by adding the <code>to</code> prop. This renders
          the button as an anchor element.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="open_in_new" to="#" />
        <QIconBtn class="q-ma-sm" icon="open_in_new" to="#" disabled />
      </QDocsSection>

      <QDocsSection title="Events">
        {#snippet sectionDescription()}
          QIconBtn supports standard event handlers like <code>onclick</code>. Events are not
          triggered when the button is disabled.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="touch_app" onclick={() => alert("Omg you did it")} />
        <QIconBtn
          class="q-ma-sm"
          icon="touch_app"
          onclick={() => alert("Omg you did it")}
          disabled
        />
      </QDocsSection>

      <QDocsSection title="Shape Variations">
        {#snippet sectionDescription()}
          Expressive icon buttons can use the <code>shape</code> prop.
        {/snippet}

        <QIconBtn class="q-ma-sm" expressive icon="add" />
        <QIconBtn class="q-ma-sm" expressive icon="add" shape="squared" />
      </QDocsSection>

      <QDocsSection title="Ripple Effect">
        {#snippet sectionDescription()}
          QIconBtn includes a ripple effect by default. You can disable it or customize its color.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="touch_app" />
        <QIconBtn class="q-ma-sm" icon="touch_app" noRipple />
        <QIconBtn class="q-ma-sm" icon="touch_app" rippleColor="error" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
