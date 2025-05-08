<script lang="ts">
  import { assets } from "$app/paths";
  import { QBtnDocs } from "$components/button/docs";
  import { QBtn } from "$lib";
  import { QDocs, QDocsSection } from "$private";

  import snippets from "./docs.snippets";
</script>

<QDocs {snippets} componentDocs={QBtnDocs}>
  {#snippet display()}
    <QBtn icon="star">Star me on Github</QBtn>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default Buttons">
        {#snippet sectionDescription()}
          QBtn is a versatile component that can display text, icons, or both. It supports various
          styling options and states. It's accessible out of the box so, when the button is focused,
          the enter and space keys can be used to trigger it.
        {/snippet}

        <QBtn class="q-ma-sm" icon="favorite" label="Using Label" />
        <QBtn class="q-ma-sm q-gap-md">
          <span>Using</span>
          <span class="text-tertiary">children snippet</span>
        </QBtn>
      </QDocsSection>

      <QDocsSection title="Loading State Buttons">
        {#snippet sectionDescription()}
          Buttons can display a loading indicator, useful for operations that take time to complete.
          When the loading prop is true, a circular progress indicator replaces any icon.
        {/snippet}

        <QBtn class="q-ma-sm" label="loading" loading />
        <QBtn class="q-ma-sm" icon="refresh" loading />
      </QDocsSection>

      <QDocsSection title="Disabled State Buttons">
        {#snippet sectionDescription()}
          Disabled buttons indicate that an action is unavailable. They maintain their appearance
          but don't respond to user interaction.
        {/snippet}

        <QBtn class="q-ma-sm" icon="add" label="Disabled" disabled />
        <QBtn class="q-ma-sm" disabled>
          <span>Disabled</span>
          <span class="text-red">Button</span>
        </QBtn>

        <QBtn
          class="q-ma-sm"
          label="Click me"
          disabled
          onclick={() => alert("What's this sorcery?!")}
        />
      </QDocsSection>

      <QDocsSection title="Button Variants">
        {#snippet sectionDescription()}
          QBtn supports multiple variants to match your design needs. You can specify variants using
          the <code>variant</code> prop.
        {/snippet}

        <QBtn class="q-ma-sm" label="Elevated (default)" icon="star" />
        <QBtn class="q-ma-sm" label="Unelevated" unelevated icon="star" />
        <QBtn class="q-ma-sm" label="Filled" variant="filled" icon="star" />
        <QBtn class="q-ma-sm" label="Tonal" variant="tonal" icon="star" />
        <QBtn class="q-ma-sm" label="Outlined" variant="outlined" icon="star" />
        <QBtn class="q-ma-sm" label="Flat" variant="flat" icon="star" />
        <QBtn class="q-ma-sm" label="With image" icon="img:{assets}/cocktail.jpg" />
      </QDocsSection>

      <QDocsSection title="Button Variants Using Boolean Props">
        {#snippet sectionDescription()}
          As an alternative to the <code>variant</code> prop, you can use boolean props to set the button
          variant. If multiple boolean variant props are used, the ones with higher precedence will take
          effect. The precedence order is: filled &gt; tonal &gt; outlined &gt; flat.
        {/snippet}

        <QBtn class="q-ma-sm" label="Elevated (default)" />
        <QBtn class="q-ma-sm" label="Unelevated" unelevated />
        <QBtn class="q-ma-sm" label="Filled" filled />
        <QBtn class="q-ma-sm" label="Tonal" tonal />
        <QBtn class="q-ma-sm" label="Outlined" outlined />
        <QBtn class="q-ma-sm" label="Flat" flat />
      </QDocsSection>

      <QDocsSection title="Size">
        {#snippet sectionDescription()}
          QBtn supports different sizes to fit various layouts. Available options are sm, md
          (default), lg, and xl.
        {/snippet}

        <QBtn class="q-ma-sm" size="sm" label="Small" unelevated />
        <QBtn class="q-ma-sm" label="Medium" unelevated />
        <QBtn class="q-ma-sm" size="lg" label="Large" unelevated />
        <QBtn class="q-ma-sm" size="xl" label="Extra Large" unelevated />
      </QDocsSection>

      <QDocsSection title="Button with Router Link">
        {#snippet sectionDescription()}
          Buttons can function as navigation links by adding the <code>to</code> prop. This renders the
          button as an anchor element instead of a button.
        {/snippet}

        <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="#" />
        <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="#" disabled />
      </QDocsSection>

      <QDocsSection title="Events">
        {#snippet sectionDescription()}
          QBtn supports standard event handlers like <code>onclick</code>. Events are not triggered
          when the button is disabled.
        {/snippet}

        <QBtn class="q-ma-sm" label="Click me" onclick={() => alert("Omg you did it")} />
        <QBtn class="q-ma-sm" label="Click me" onclick={() => alert("Omg you did it")} disabled />
      </QDocsSection>

      <QDocsSection title="Shape Variations">
        {#snippet sectionDescription()}
          QBtn can be displayed in different shapes using the <code>round</code> or
          <code>rectangle</code> props.
        {/snippet}

        <QBtn class="q-ma-sm" label="Default" />
        <QBtn class="q-ma-sm" icon="add" round />
        <QBtn class="q-ma-sm" label="Rectangle" rectangle />
        <QBtn class="q-ma-sm" icon="add" label="Icon and Rectangle" rectangle />
        <QBtn class="q-ma-sm" loading rectangle />
      </QDocsSection>

      <QDocsSection title="Ripple Effect">
        {#snippet sectionDescription()}
          QBtn includes a ripple effect by default. You can disable it or customize its color.
        {/snippet}

        <QBtn class="q-ma-sm" label="Default ripple" />
        <QBtn class="q-ma-sm" label="No ripple" noRipple />
        <QBtn class="q-ma-sm" label="Custom ripple color" rippleColor="error" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
