<script lang="ts">
  import { QChipDocs } from "$components/chip/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QChip } from "$lib";
  import { QDocs, QDocsSection } from "$docs";

  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QChipDocs });

  let selectedValue = $state(false);
  let kindInputValue = $state("Input");
  let inputValue = $state("example@email.com");
  let contactValue = $state("Ada Lovelace <ada@example.com>");
  let importantValue = $state("Important");
  let avatarValue = $state("Cocktail");
  let eventInputValue = $state("Input chip");

  const contactLabel = $derived(contactValue.split("<", 1)[0].trim());
</script>

<svelte:head>
  <title>{pageTitle("QChip")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QChip elevated icon="calendar_today" label="Add to calendar" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Chip Kinds">
        {#snippet sectionDescription()}
          QChip supports four different kinds that determine its behavior and appearance: assist
          (default), filter, input, and suggestion. Each kind serves a specific purpose in user
          interfaces.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip icon="map" label="Assist (default)" />
          <QChip kind="filter" icon="filter_list" label="Filter" bind:selected={selectedValue} />
          <QChip kind="input" icon="person" trailingIcon="close" bind:value={kindInputValue} />
          <QChip kind="suggestion" icon="lightbulb" label="Suggestion" />
        </div>
      </QDocsSection>

      <QDocsSection title="Chip Appearances">
        {#snippet sectionDescription()}
          Assist, filter, and suggestion chips can have <code>outlined</code> (default) or
          <code>elevated</code> appearances. Elevated chips have a shadow and container color, while outlined
          chips have a one-pixel border.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip label="Outlined (default)" icon="article" />
          <QChip elevated label="Elevated" icon="layers" />
        </div>
      </QDocsSection>

      <QDocsSection title="Filter Chips">
        {#snippet sectionDescription()}
          Filter chips support selection states. When selected, they display a checkmark instead of
          their leading icon. You can bind to the <code>selected</code> prop to track selection state.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg q-ma-sm">
          <QChip kind="filter" icon="location_city" label="Paris" bind:selected={selectedValue} />
          <QChip kind="filter" icon="restaurant" label="Restaurants" />
          <QChip kind="filter" elevated icon="local_cafe" label="Cafés" />
        </div>
        <div>Selected: {selectedValue}</div>
      </QDocsSection>

      <QDocsSection title="Input Chips">
        {#snippet sectionDescription()}
          Input chips represent user-entered information. When activated, they become editable text.
          Bind their <code>value</code> to store that text. With keyboard focus, Backspace selects the
          whole chip and a second press activates its trailing action.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip kind="input" icon="mail" bind:value={inputValue} trailingIcon="close" />
          <QChip
            kind="input"
            icon="person"
            label={contactLabel}
            bind:value={contactValue}
            trailingIcon="close"
          />
          <QChip kind="input" icon="tag" bind:value={importantValue} trailingIcon="close" />
        </div>
        <div>Value: {inputValue}</div>
      </QDocsSection>

      <QDocsSection title="Suggestion Chips">
        {#snippet sectionDescription()}
          Suggestion chips help users refine search queries or content. They don't support trailing
          icons.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip kind="suggestion" icon="search" label="Search nearby" />
          <QChip kind="suggestion" icon="history" label="Recent searches" />
          <QChip kind="suggestion" elevated icon="trending_up" label="Trending" />
        </div>
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Any chip can be disabled, making it non-interactive while visually indicating its
          unavailability.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip disabled label="Disabled chip" icon="block" />
          <QChip disabled elevated label="Disabled elevated" icon="warning" />
          <QChip disabled kind="filter" label="Disabled filter" icon="filter_alt" />
        </div>
      </QDocsSection>

      <QDocsSection title="Input Chips with Avatars">
        {#snippet sectionDescription()}
          Input chips can display a 24-pixel avatar by using the <code>icon</code> prop with an "img:"
          prefix.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip
            kind="input"
            icon="img:/cocktail.jpg"
            bind:value={avatarValue}
            trailingIcon="close"
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Styling">
        {#snippet sectionDescription()}
          Chips can be customized with additional classes to match your design system's colors and
          styles.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip class="bg-green" label="Green Chip" />
          <QChip class="error" label="Error Chip" />
          <QChip class="primary" label="Primary Chip" />
          <QChip class="primary-container" label="Primary Container" />
        </div>
      </QDocsSection>

      <QDocsSection title="Ripple Effect">
        {#snippet sectionDescription()}
          QChips include a ripple effect by default when interacted with. This can be disabled using
          the <code>noRipple</code> prop.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip label="Default ripple" icon="touch_app" />
          <QChip noRipple label="No ripple" icon="do_not_touch" />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          QChips are keyboard-accessible, function as buttons, and can be activated with Space or
          Enter keys.
        {/snippet}

        <p class="text-sm">Focus the chips below using Tab and activate with Space or Enter:</p>
        <div class="flex flex-wrap q-gap-lg items-center">
          <QChip label="Keyboard accessible" icon="keyboard" />
          <QChip kind="filter" label="Selectable with keyboard" icon="filter_list" />
        </div>
      </QDocsSection>

      <QDocsSection title="Event Handling">
        {#snippet sectionDescription()}
          QChips support standard event handlers like <code>onclick</code>. For filter chips,
          clicking toggles the selected state. For input chips, the trailing icon can be customized
          to perform actions like removing the chip with the <code>onTrailingIconClick</code>
          prop.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip label="Click me" icon="notifications" onclick={() => alert("Chip clicked!")} />
          <QChip
            kind="input"
            icon="person"
            bind:value={eventInputValue}
            trailingIcon="close"
            onTrailingIconClick={() => alert("Trailing icon clicked!")}
          />
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
