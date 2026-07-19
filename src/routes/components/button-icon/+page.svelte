<script lang="ts">
  import { QIconBtnDocs } from "$components/button/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QIconBtn } from "$lib";
  import { QDocs, QDocsSection } from "$docs";

  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QIconBtnDocs });

  let favoriteSelected = $state(false);
  let outlinedSelected = $state(true);
</script>

<svelte:head>
  <title>{pageTitle("QIconBtn")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QIconBtn icon="star" aria-label="Star" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default Icon Buttons">
        {#snippet sectionDescription()}
          QIconBtn is a button component that displays only an icon. It's built on top of QBtn and
          inherits most of its features and properties.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="favorite" aria-label="Favorite" />
        <QIconBtn class="q-ma-sm" icon="search" aria-label="Search" />
        <QIconBtn class="q-ma-sm" icon="share" aria-label="Share" />
      </QDocsSection>

      <QDocsSection title="Width Options">
        {#snippet sectionDescription()}
          Expressive icon buttons support narrow, default, and wide widths using the
          <code>width</code> prop.
        {/snippet}

        <QIconBtn class="q-ma-sm" expressive icon="favorite" width="narrow" aria-label="Favorite" />
        <QIconBtn
          class="q-ma-sm"
          expressive
          icon="favorite"
          width="default"
          aria-label="Favorite"
        />
        <QIconBtn class="q-ma-sm" expressive icon="favorite" width="wide" aria-label="Favorite" />
      </QDocsSection>

      <QDocsSection title="Loading State">
        {#snippet sectionDescription()}
          Icon buttons can display a loading indicator. When the loading prop is true, a circular
          progress indicator replaces the icon.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="refresh" loading aria-label="Refresh" />
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Disabled icon buttons indicate that an action is unavailable. They maintain their
          appearance but don't respond to user interaction.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="add" disabled aria-label="Add" />
        <QIconBtn
          class="q-ma-sm"
          icon="close"
          aria-label="Close"
          disabled
          onclick={() => alert("What's this sorcery?!")}
        />
      </QDocsSection>

      <QDocsSection title="Button Variants">
        {#snippet sectionDescription()}
          QIconBtn supports multiple variants to match your design needs. You can specify variants
          using the <code>variant</code> prop.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="star" aria-label="Standard" />
        <QIconBtn class="q-ma-sm" icon="star" variant="filled" aria-label="Filled" />
        <QIconBtn class="q-ma-sm" icon="star" variant="tonal" aria-label="Tonal" />
        <QIconBtn class="q-ma-sm" icon="star" variant="outlined" aria-label="Outlined" />
      </QDocsSection>

      <QDocsSection title="Button Variants Using Boolean Props">
        {#snippet sectionDescription()}
          As an alternative to the <code>variant</code> prop, you can use boolean props to set the button
          variant.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="star" aria-label="Standard" />
        <QIconBtn class="q-ma-sm" icon="star" filled aria-label="Filled" />
        <QIconBtn class="q-ma-sm" icon="star" tonal aria-label="Tonal" />
        <QIconBtn class="q-ma-sm" icon="star" outlined aria-label="Outlined" />
      </QDocsSection>

      <QDocsSection title="Size">
        {#snippet sectionDescription()}
          Baseline Material 3 uses the 40px <code>md</code> size by default. Quaff also keeps
          <code>sm</code>, <code>lg</code>, and <code>xl</code> compatibility sizes.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="star" size="sm" aria-label="Small" />
        <QIconBtn class="q-ma-sm" icon="star" aria-label="Medium" />
        <QIconBtn class="q-ma-sm" icon="star" size="lg" aria-label="Large" />
        <QIconBtn class="q-ma-sm" icon="star" size="xl" aria-label="Extra large" />
      </QDocsSection>

      <QDocsSection title="Expressive Icon Buttons">
        {#snippet sectionDescription()}
          Enable <code>expressive</code> for one button, or pass
          <code>{`{ expressive: true }`}</code>
          to <code>Quaff.init()</code> to use the Material 3 Expressive styles globally.
        {/snippet}

        <QIconBtn
          class="q-ma-sm"
          expressive
          icon="star"
          size="xs"
          filled
          aria-label="Extra small"
        />
        <QIconBtn class="q-ma-sm" expressive icon="star" filled aria-label="Small" />
        <QIconBtn class="q-ma-sm" expressive icon="star" size="md" filled aria-label="Medium" />
        <QIconBtn
          class="q-ma-sm"
          expressive
          icon="star"
          size="md"
          width="wide"
          shape="squared"
          tonal
          aria-label="Wide squared"
        />
      </QDocsSection>

      <QDocsSection title="Toggle Icon Buttons">
        {#snippet sectionDescription()}
          Toggle icon buttons are available in both baseline Material 3 and Material 3 Expressive.
          Bind <code>selected</code> to update both the value and <code>aria-pressed</code> when activated.
        {/snippet}

        <QIconBtn
          class="q-ma-sm"
          bind:selected={favoriteSelected}
          icon="favorite"
          aria-label="Favorite"
        />
        <QIconBtn
          class="q-ma-sm"
          expressive
          bind:selected={outlinedSelected}
          icon="notifications"
          outlined
          aria-label="Notifications"
        />
      </QDocsSection>

      <QDocsSection title="Button with Router Link">
        {#snippet sectionDescription()}
          Icon buttons can function as navigation links by adding the <code>to</code> prop. This renders
          the button as an anchor element.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="open_in_new" to="#" aria-label="Open link" />
        <QIconBtn class="q-ma-sm" icon="open_in_new" to="#" disabled aria-label="Open link" />
      </QDocsSection>

      <QDocsSection title="Events">
        {#snippet sectionDescription()}
          QIconBtn supports standard event handlers like <code>onclick</code>. Events are not
          triggered when the button is disabled.
        {/snippet}

        <QIconBtn
          class="q-ma-sm"
          icon="touch_app"
          aria-label="Activate"
          onclick={() => alert("Omg you did it")}
        />
        <QIconBtn
          class="q-ma-sm"
          icon="touch_app"
          aria-label="Activate"
          onclick={() => alert("Omg you did it")}
          disabled
        />
      </QDocsSection>

      <QDocsSection title="Shape Variations">
        {#snippet sectionDescription()}
          Expressive icon buttons can use the <code>shape</code> prop.
        {/snippet}

        <QIconBtn class="q-ma-sm" expressive icon="add" aria-label="Add" />
        <QIconBtn class="q-ma-sm" expressive icon="add" shape="squared" aria-label="Add" />
      </QDocsSection>

      <QDocsSection title="Ripple Effect">
        {#snippet sectionDescription()}
          QIconBtn includes a ripple effect by default. You can disable it or customize its color.
        {/snippet}

        <QIconBtn class="q-ma-sm" icon="touch_app" aria-label="Activate" />
        <QIconBtn class="q-ma-sm" icon="touch_app" noRipple aria-label="Activate" />
        <QIconBtn class="q-ma-sm" icon="touch_app" rippleColor="error" aria-label="Activate" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
