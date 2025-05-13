<script lang="ts">
  import { assets } from "$app/paths";
  import { QChipDocs } from "$components/chip/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QChip } from "$lib";
  import { QDocs, QDocsSection } from "$private";

  import snippets from "./docs.snippets";

  let selectedValue = false;
</script>

<svelte:head>
  <title>{pageTitle("QChip")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QChipDocs}>
  {#snippet display()}
    <QChip elevated icon="img:{assets}/cocktail.jpg" label="Cocktail" />
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
          <QChip kind="input" icon="person" trailingIcon="close" label="Input" />
          <QChip kind="suggestion" icon="lightbulb" label="Suggestion" />
        </div>
      </QDocsSection>

      <QDocsSection title="Chip Appearances">
        {#snippet sectionDescription()}
          QChips can have <code>outlined</code> (default) or <code>elevated</code> appearances. Elevated
          chips have a shadow and background color, while outlined chips have a border.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip label="Outlined (default)" icon="article" />
          <QChip elevated label="Elevated" icon="layers" />
        </div>
      </QDocsSection>

      <QDocsSection title="Chip Sizes">
        {#snippet sectionDescription()}
          QChips come in three sizes: small (default), medium, and large.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip label="Small (default)" size="sm" icon="smartphone" />
          <QChip label="Medium" size="md" icon="tablet" />
          <QChip label="Large" size="lg" icon="computer" />
        </div>
      </QDocsSection>

      <QDocsSection title="Filter Chips">
        {#snippet sectionDescription()}
          Filter chips support selection states. When selected, they display a checkmark instead of
          their leading icon. You can bind to the <code>selected</code> prop to track selection state.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg mb-4">
          <div class="flex column q-gap-sm">
            <QChip kind="filter" icon="location_city" label="Paris" bind:selected={selectedValue} />
            <div>Selected: {selectedValue}</div>
          </div>
          <QChip kind="filter" icon="restaurant" label="Restaurants" />
          <QChip kind="filter" elevated icon="local_cafe" label="Cafés" />
        </div>
      </QDocsSection>

      <QDocsSection title="Input Chips">
        {#snippet sectionDescription()}
          Input chips typically represent discrete pieces of information and can include a trailing
          icon that functions as a remove button.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip kind="input" icon="mail" label="example@email.com" trailingIcon="close" />
          <QChip kind="input" icon="person" label="John Doe" trailingIcon="close" />
          <QChip kind="input" elevated icon="tag" label="Important" trailingIcon="close" />
        </div>
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

      <QDocsSection title="Chips with Images">
        {#snippet sectionDescription()}
          Chips can display images as avatars by using the <code>icon</code> prop with an "img:" prefix.
          This is useful for representing people or categories with visual elements.
        {/snippet}

        <div class="flex flex-wrap q-gap-lg items-center q-ma-sm">
          <QChip icon="img:{assets}/cocktail.jpg" label="Cocktail" />
          <QChip elevated icon="img:{assets}/cocktail.jpg" label="Elevated with image" />
          <QChip kind="filter" icon="img:{assets}/cocktail.jpg" label="Filter with image" />
          <QChip
            kind="input"
            icon="img:{assets}/cocktail.jpg"
            label="Input with image"
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
          QChips are keyboard-accessible and include appropriate ARIA attributes. Filter and assist
          chips function as buttons and can be activated with Space or Enter keys.
        {/snippet}

        <p class="text-sm mb-2">
          Focus the chips below using Tab and activate with Space or Enter:
        </p>
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
            label="Input chip"
            trailingIcon="close"
            onTrailingIconClick={() => alert("Trailing icon clicked!")}
          />
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
