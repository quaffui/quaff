<script lang="ts">
  import { QRadioDocs } from "$components/radio/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QCardSection, QIcon, QItem, QItemSection, QList, QRadio } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";

  let displayValue = $state("option1");
  let selectedValue = $state("option1");
  let selectedFruit = $state("apple");
  let selectedColor = $state("red");
  let selectedSize = $state("md");
  let selectedProgrammingLanguage = $state("");
  let eventSelectedValue = $state("event-option1");
</script>

<svelte:head>
  <title>{pageTitle("QRadio")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QRadioDocs}>
  {#snippet display()}
    <div class="flex column q-gap-sm">
      <QRadio value="option1" bind:selected={displayValue} label="Option 1" />
      <QRadio value="option2" bind:selected={displayValue} label="Option 2" />
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Radio Buttons">
        {#snippet sectionDescription()}
          QRadio buttons allow users to select a single option from a set. They're commonly used for
          exclusive selections where only one option can be chosen at a time.
        {/snippet}

        <div class="q-ma-sm">
          <QRadio class="q-ma-sm" value="option1" bind:selected={selectedValue} label="Option 1" />
          <QRadio class="q-ma-sm" value="option2" bind:selected={selectedValue} label="Option 2" />
          <QRadio class="q-ma-sm" value="option3" bind:selected={selectedValue} label="Option 3" />
          <div class="q-mt-sm">Selected value: {selectedValue}</div>
        </div>
      </QDocsSection>

      <QDocsSection title="Radio Groups">
        {#snippet sectionDescription()}
          Radio buttons with the same <code>selected</code> binding form a group, ensuring that only
          one option can be selected at a time. When a new option is selected, the previously selected
          option is automatically deselected.
        {/snippet}

        <QCard class="q-ma-md" style="max-width: 400px;">
          <QCardSection>
            <h6 class="q-my-xs">Select your favorite fruit:</h6>
            <div class="q-ml-md">
              <QRadio class="q-ma-sm" value="apple" bind:selected={selectedFruit} label="Apple" />
              <QRadio class="q-ma-sm" value="banana" bind:selected={selectedFruit} label="Banana" />
              <QRadio class="q-ma-sm" value="orange" bind:selected={selectedFruit} label="Orange" />
              <QRadio
                class="q-ma-sm"
                value="strawberry"
                bind:selected={selectedFruit}
                label="Strawberry"
              />
            </div>
          </QCardSection>
          <QCardSection>
            <div>You selected: {selectedFruit}</div>
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Radio buttons can be disabled using the <code>disable</code> prop. Disabled radio buttons cannot
          be interacted with and display with a muted appearance to indicate they're unavailable.
        {/snippet}

        <div class="q-ma-sm">
          <QRadio class="q-ma-sm" value="enabled" label="Enabled radio button" />
          <QRadio class="q-ma-sm" value="disabled" label="Disabled radio button" disable />
          <QRadio
            class="q-ma-sm"
            value="disabled-selected"
            selected="disabled-selected"
            label="Disabled and selected"
            disable
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QRadio supports Svelte's two-way binding with the <code>bind</code>selected` directive.
          This makes it easy to track and update the selected value in your component's state.
        {/snippet}

        <div class="q-ma-sm flex column q-gap-md">
          <div>
            <QRadio class="q-ma-sm" value="red" bind:selected={selectedColor} label="Red" />
            <QRadio class="q-ma-sm" value="green" bind:selected={selectedColor} label="Green" />
            <QRadio class="q-ma-sm" value="blue" bind:selected={selectedColor} label="Blue" />
          </div>

          <div class="flex q-gap-md items-center">
            <div>Current selection: <span class="text-bold">{selectedColor}</span></div>
            <QBtn size="sm" label="Select Green" onclick={() => (selectedColor = "green")} />
          </div>

          <div>
            <div
              style="width: 100px; height: 40px; background-color: {selectedColor}; 
                border-radius: 4px; border: 1px solid var(--outline)"
            ></div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Horizontal Layout">
        {#snippet sectionDescription()}
          Radio buttons can be arranged horizontally by using appropriate layout classes or
          containers. This is useful for shorter lists of options or where space is limited.
        {/snippet}

        <div class="q-ma-sm">
          <div class="text-subtitle1 q-mb-xs">Select size:</div>
          <div class="flex flex-wrap q-gap-x-lg">
            <QRadio value="sm" bind:selected={selectedSize} label="Small" />
            <QRadio value="md" bind:selected={selectedSize} label="Medium" />
            <QRadio value="lg" bind:selected={selectedSize} label="Large" />
            <QRadio value="xl" bind:selected={selectedSize} label="Extra Large" />
          </div>
          <div class="q-mt-sm">Selected size: {selectedSize}</div>
        </div>
      </QDocsSection>

      <QDocsSection title="With List Items">
        {#snippet sectionDescription()}
          Radio buttons can be combined with QList and QItem components to create rich, interactive
          selection interfaces with additional content or styling.
        {/snippet}

        <QList bordered style="max-width: 400px;" class="q-ma-sm">
          <QItem tag="label" clickable>
            <QItemSection type="avatar">
              <QRadio value="option1" bind:selected={selectedValue} />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                Option 1
              {/snippet}
              {#snippet line1()}
                First choice with description
              {/snippet}
            </QItemSection>
          </QItem>

          <QItem tag="label" clickable>
            <QItemSection type="avatar">
              <QRadio value="option2" bind:selected={selectedValue} />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                Option 2
              {/snippet}
              {#snippet line1()}
                Second choice with description
              {/snippet}
            </QItemSection>
          </QItem>

          <QItem tag="label" clickable>
            <QItemSection type="avatar">
              <QRadio value="option3" bind:selected={selectedValue} />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                Option 3
              {/snippet}
              {#snippet line1()}
                Third choice with description
              {/snippet}
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Dynamic Radio Buttons">
        {#snippet sectionDescription()}
          You can generate radio buttons dynamically from an array of options using Svelte's each
          block. This is useful when working with data-driven forms or when the options might
          change.
        {/snippet}

        <div class="q-ma-sm">
          <QCard class="q-pa-md" style="max-width: 400px;">
            <div class="text-subtitle1 q-mb-xs">Favorite programming language:</div>
            {#each ["JavaScript", "TypeScript", "Svelte", "Vue", "React"] as language (language)}
              <QRadio
                class="q-ma-sm"
                value={language.toLowerCase()}
                bind:selected={selectedProgrammingLanguage}
                label={language}
              />
            {/each}
            <div class="q-mt-sm">You selected: {selectedProgrammingLanguage || "Nothing yet"}</div>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Event Handling">
        {#snippet sectionDescription()}
          QRadio components support standard event handlers like <code>onchange</code>. This allows
          you to perform actions when the selection changes.
        {/snippet}

        <div class="q-ma-sm">
          <QRadio
            class="q-ma-sm"
            value="event-option1"
            bind:selected={eventSelectedValue}
            label="Option with event handler"
            onchange={() => alert(`Changed to: ${eventSelectedValue}`)}
          />
          <QRadio
            class="q-ma-sm"
            value="event-option2"
            bind:selected={eventSelectedValue}
            label="Another option"
            onchange={() => alert(`Changed to: ${eventSelectedValue}`)}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          QRadio components are built with accessibility in mind. They use native radio inputs under
          the hood and include appropriate ARIA attributes, ensuring they work well with screen
          readers and keyboard navigation.
        {/snippet}

        <div class="q-ma-sm">
          <div class="q-mb-sm">Keyboard navigation:</div>
          <QList dense>
            <QItem>
              <QItemSection type="avatar">
                <QIcon name="chevron_right" />
              </QItemSection>
              <QItemSection>
                Tab: Move focus to the next focusable element out of the radio group
              </QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="avatar">
                <QIcon name="chevron_right" />
              </QItemSection>
              <QItemSection>Space: Select the focused radio button</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="avatar">
                <QIcon name="chevron_right" />
              </QItemSection>
              <QItemSection>Arrow keys: Navigate between radio buttons in a group</QItemSection>
            </QItem>
          </QList>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
