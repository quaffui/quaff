<script lang="ts">
  import { QSelect, QBtn, QIcon, QCard, QCardSection, QCardActions, QList, QItem } from "$lib";
  import { QSelectDocs } from "$components/select/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let selectDisabled = $state(true);
  let dynamicSelect = $state("");
  const initialCountries = $state(["United States", "Canada", "Mexico"]);
  let dynamicOptions = $state(initialCountries);

  function loadMoreCountries() {
    dynamicOptions = [
      ...dynamicOptions,
      "Brazil",
      "Argentina",
      "United Kingdom",
      "France",
      "Germany",
    ];
  }

  let options = ["Cats", "Dogs", "Capybaras"];
  let objectOptions = [
    { label: "Red", value: "red" },
    { label: "Green", value: "green" },
    { label: "Blue", value: "blue" },
  ];

  let value = $state("");
  let select = $state("");
  let colorSelect = $state("");
  let selectMultiple: string[] = $state([]);

  const displayValue = $derived.by(() => {
    if (!selectMultiple.length) {
      return "None";
    }

    if (selectMultiple.length > 1) {
      const firstParts = selectMultiple.slice(0, -1);
      const lastPart = selectMultiple.at(-1);
      return `${firstParts.join(", ")} and ${lastPart}`;
    }

    return selectMultiple[0];
  });
</script>

<QDocs {snippets} componentDocs={QSelectDocs}>
  {#snippet display()}
    <QSelect label="Favorite animal" {options} bind:value />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          QSelect allows users to choose one or multiple options from a dropdown list. It supports
          various configurations for different UI requirements and validates user input.
        {/snippet}

        <div class="q-ma-sm" style="max-width: 300px;">
          <QSelect bind:value={select} {options} label="Choose an animal" />
          <div class="q-mt-sm">Selected value: {select || "None"}</div>
        </div>
      </QDocsSection>

      <QDocsSection title="Working with Options">
        {#snippet sectionDescription()}
          QSelect accepts options as an array of strings or as objects with <code>label</code> and
          <code>value</code>
          properties. Using objects allows you to display a friendly label while storing a different
          value.
        {/snippet}

        <div class="flex q-gap-md">
          <div class="q-ma-sm" style="max-width: 300px;">
            <h6 class="q-mb-sm">String options</h6>
            <QSelect bind:value={select} {options} label="Choose an animal" />
            <div class="q-mt-sm">Selected: {select}</div>
          </div>

          <div class="q-ma-sm" style="max-width: 300px;">
            <h6 class="q-mb-sm">Object options</h6>
            <QSelect bind:value={colorSelect} options={objectOptions} label="Choose a color" />
            <div class="q-mt-sm">
              Selected value: {colorSelect || "None"}
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Multiple Selection">
        {#snippet sectionDescription()}
          Enable multiple selection with the <code>multiple</code> prop. This allows users to select
          more than one option from the dropdown menu.
        {/snippet}

        <div class="q-ma-sm" style="max-width: 300px;">
          <QSelect bind:value={selectMultiple} {options} label="Select multiple animals" multiple />
          <div class="q-mt-sm">
            Selected values: {selectMultiple.length ? selectMultiple.join(", ") : "None"}
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Display Value">
        {#snippet sectionDescription()}
          Use the <code>displayValue</code> prop to customize how selected values are displayed in the
          select input. This is particularly useful for multiple selection.
        {/snippet}

        <div class="q-ma-sm" style="max-width: 300px;">
          <QSelect
            bind:value={selectMultiple}
            {displayValue}
            {options}
            label="Multiple with custom display"
            multiple
          />
          <div class="q-mt-sm">
            <div>Selected values: {selectMultiple.join(", ") || "None"}</div>
            <div>Display value: {displayValue}</div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Select Styles">
        {#snippet sectionDescription()}
          QSelect supports different style variants: default, outlined, filled, and rounded. Choose
          the style that best fits your UI design.
        {/snippet}

        <div class="row q-gap-md">
          <div class="col-6">
            <QSelect bind:value={select} {options} label="Default style" />
          </div>

          <div class="col-6">
            <QSelect bind:value={select} {options} label="Outlined" outlined />
          </div>

          <div class="col-6">
            <QSelect bind:value={select} {options} label="Filled" filled />
          </div>

          <div class="col-6">
            <QSelect bind:value={select} {options} label="Rounded" rounded />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Dense Layout">
        {#snippet sectionDescription()}
          The <code>dense</code> prop makes the select component more compact, useful for forms with
          space constraints or for when you need to display multiple selects in a limited space.
        {/snippet}

        <div class="row q-gap-md">
          <div class="col-6">
            <QSelect bind:value={select} {options} label="Standard height" outlined />
          </div>

          <div class="col-6">
            <QSelect bind:value={select} {options} label="Dense height" outlined dense />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Use the <code>disable</code> prop to prevent user interaction with the select component. Disabled
          selects maintain their appearance but don't respond to user input.
        {/snippet}

        <div class="flex column flex-center q-gap-lg q-ma-md">
          <QSelect
            class=""
            value={select}
            {options}
            label="Disabled select"
            disable={selectDisabled}
          />
          <div class="">
            <QBtn size="sm" label="Enable" onclick={() => (selectDisabled = false)} />
            <QBtn size="sm" label="Disable" onclick={() => (selectDisabled = true)} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Validation and Hints">
        {#snippet sectionDescription()}
          QSelect provides built-in support for validation states and helper text. Use the <code
            >error</code
          >
          prop to indicate validation errors and <code>hint</code> to provide additional guidance to
          users.
        {/snippet}

        <div class="flex flex-wrap q-gap-md">
          <div style="max-width: 250px;">
            <QSelect
              bind:value={select}
              {options}
              label="With hint"
              hint="Select your favorite animal"
            />
          </div>

          <div style="max-width: 250px;">
            <QSelect
              bind:value={select}
              {options}
              label="Error state"
              error
              errorMessage="Selection is required"
            />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Icons and Content">
        {#snippet sectionDescription()}
          Enhance your selects with custom content using the <code>prepend</code>,
          <code>append</code>, <code>before</code>, and
          <code>after</code> slots. These allow you to add icons or other content around the select field.
        {/snippet}

        <div class="row q-gap-md q-mb-md">
          <QSelect bind:value={select} {options} label="With prepend icon" class="col-6">
            {#snippet prepend()}
              <QIcon name="pets" />
            {/snippet}
          </QSelect>

          <QSelect bind:value={select} {options} label="With append icon" class="col-6">
            {#snippet append()}
              <QIcon name="favorite" />
            {/snippet}
          </QSelect>
        </div>

        <div class="row q-gap-md q-mt-md">
          <QSelect bind:value={select} {options} label="With before content" class="col-6">
            {#snippet before()}
              <div class="q-mr-sm">
                <QIcon name="info" />
              </div>
            {/snippet}
          </QSelect>

          <QSelect bind:value={select} {options} label="With after content" class="col-6">
            {#snippet after()}
              <div class="q-ml-sm">
                <QIcon name="help" />
              </div>
            {/snippet}
          </QSelect>
        </div>
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QSelect supports Svelte's two-way binding with the <code>bind</code>value directive. This
          makes it easy to sync the select's state with your component's variables.
        {/snippet}

        <div class="q-ma-sm">
          <QCard class="q-pa-md" style="max-width: 500px;">
            <QCardSection>
              <QSelect bind:value={select} {options} label="Select an animal" />
            </QCardSection>

            <QCardSection class="q-pt-none">
              <div class="flex q-gap-md items-center q-mt-sm">
                <span>Current selection: <strong>{select || "None"}</strong></span>
                <QBtn size="sm" label="Reset" onclick={() => (select = "")} />
                <QBtn size="sm" label="Select 'Dogs'" onclick={() => (select = "Dogs")} />
              </div>
            </QCardSection>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Dynamic Options">
        {#snippet sectionDescription()}
          You can dynamically generate options based on data. This is useful when working with
          options that might change or are loaded from an external source.
        {/snippet}

        <div class="q-ma-sm">
          <QCard class="q-pa-md" style="max-width: 500px;">
            <QCardSection>
              <QSelect
                bind:value={dynamicSelect}
                options={dynamicOptions}
                label="Select a country"
              />
            </QCardSection>

            <QCardActions class="q-mt-md" align="right">
              <QBtn
                size="sm"
                label="Load more countries"
                onclick={loadMoreCountries}
                class="q-mr-sm"
              />
              <QBtn
                size="sm"
                label="Reset countries"
                onclick={() => (dynamicOptions = initialCountries)}
              />
            </QCardActions>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Responsive Design">
        {#snippet sectionDescription()}
          QSelect is fully responsive and adapts to its container width. You can use it in various
          layouts and grid systems.
        {/snippet}

        <div class="row q-gutter-md q-ma-sm">
          <div class="col-12 col-sm-6 col-md-4">
            <QSelect bind:value={select} {options} label="Full width on small screens" />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <QSelect bind:value={select} {options} label="Responsive width" />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <QSelect bind:value={select} {options} label="Adapts to container" />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          QSelect is built with accessibility in mind. It supports keyboard navigation, focus
          states, and appropriate ARIA attributes for screen readers.
        {/snippet}

        <div class="q-ma-sm">
          <p>Keyboard navigation support:</p>
          <QList dense>
            <QItem><code>Tab</code>Moves focus to the select (not yet supported)</QItem>
            <QItem><code>Enter/Space</code>Opens the dropdown when the select is focused</QItem>
            <QItem>
              <code>Arrow keys</code>Navigate through options when the dropdown is open (not yet
              supported)
            </QItem>
            <QItem><code>Enter</code>Selects the focused option</QItem>
            <QItem>
              <code>Escape</code>Closes the dropdown without making a selection (not yet supported)
            </QItem>
          </QList>

          <QSelect
            bind:value={select}
            {options}
            label="Try keyboard navigation"
            hint="Use keyboard to interact with this select"
            class="q-mt-sm"
            style="max-width: 300px;"
          />
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
