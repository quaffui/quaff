<script lang="ts">
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QRadioDocs } from "$components/radio/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QCardSection, QItem, QItemSection, QList, QRadio } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QRadioDocs });

  const listOptions = [
    { value: "option1", label: "Option 1", description: "First choice with description" },
    { value: "option2", label: "Option 2", description: "Second choice with description" },
    { value: "option3", label: "Option 3", description: "Third choice with description" },
  ];

  let displayValue = $state("option1");
  let selectedValue = $state("option1");
  let selectedFruit = $state("apple");
  let selectedColor = $state("red");
  let radioListValue = $state("option3");
  let itemListValue = $state("option2");
  let selectedProgrammingLanguage = $state("");
  let eventSelectedValue = $state("event-option1");
  let notificationMethod = $state("email");

  function stopPropagation(event: Event) {
    event.stopPropagation();
  }
</script>

<svelte:head>
  <title>{pageTitle("QRadio")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCard class="flex column q-gap-sm">
      <QRadio name="display" value="option1" bind:selected={displayValue} label="Option 1" />
      <QRadio name="display" value="option2" bind:selected={displayValue} label="Option 2" />
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Radio Buttons">
        {#snippet sectionDescription()}
          QRadio buttons allow users to select a single option from a set. They're commonly used for
          exclusive selections where only one option can be chosen at a time.
        {/snippet}

        <div class="q-ma-sm">
          <QRadio
            class="q-ma-sm"
            name="basic"
            value="option1"
            bind:selected={selectedValue}
            label="Option 1"
          />
          <QRadio
            class="q-ma-sm"
            name="basic"
            value="option2"
            bind:selected={selectedValue}
            label="Option 2"
          />
          <QRadio
            class="q-ma-sm"
            name="basic"
            value="option3"
            bind:selected={selectedValue}
            label="Option 3"
          />
          <div class="q-mt-sm">Selected value: {selectedValue}</div>
        </div>
      </QDocsSection>

      <QDocsSection title="Radio Groups">
        {#snippet sectionDescription()}
          Radio buttons with the same <code>selected</code> binding and <code>name</code> form a group.
          This keeps their value, keyboard navigation, and native form behavior in sync.
        {/snippet}

        <QCard class="q-ma-md" style="max-width: 400px;">
          <QCardSection>
            <h6 class="q-my-xs">Select your favorite fruit:</h6>
            <div class="q-ml-md">
              <QRadio
                class="q-ma-sm"
                name="fruit"
                value="apple"
                bind:selected={selectedFruit}
                label="Apple"
              />
              <QRadio
                class="q-ma-sm"
                name="fruit"
                value="banana"
                bind:selected={selectedFruit}
                label="Banana"
              />
              <QRadio
                class="q-ma-sm"
                name="fruit"
                value="orange"
                bind:selected={selectedFruit}
                label="Orange"
              />
              <QRadio
                class="q-ma-sm"
                name="fruit"
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
          Radio buttons can be disabled using the <code>disabled</code> prop. Disabled radio buttons cannot
          be interacted with and display with a muted appearance to indicate they're unavailable.
        {/snippet}

        <div class="q-ma-sm">
          <QRadio class="q-ma-sm" value="enabled" label="Enabled radio button" />
          <QRadio class="q-ma-sm" value="disabled" label="Disabled radio button" disabled />
          <QRadio
            class="q-ma-sm"
            value="disabled-selected"
            selected="disabled-selected"
            label="Disabled and selected"
            disabled
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QRadio supports Svelte's two-way binding with the <code>bind:selected</code> directive. This
          makes it easy to track and update the selected value in your component's state.
        {/snippet}

        <div class="q-ma-sm flex column q-gap-md">
          <div>
            <QRadio
              class="q-ma-sm"
              name="color"
              value="red"
              bind:selected={selectedColor}
              label="Red"
            />
            <QRadio
              class="q-ma-sm"
              name="color"
              value="green"
              bind:selected={selectedColor}
              label="Green"
            />
            <QRadio
              class="q-ma-sm"
              name="color"
              value="blue"
              bind:selected={selectedColor}
              label="Blue"
            />
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

      <QDocsSection title="With List Items">
        {#snippet sectionDescription()}
          Keep the radio as the only action, or make the whole item selectable when a larger target
          suits the interface.
        {/snippet}

        <div class="row q-col-gutter-md q-my-md">
          <div class="col-12 col-md-6">
            <div class="title-medium q-mb-sm">Radio control</div>
            <QList bordered aria-label="Choose an option using the radio controls">
              {#each listOptions as option (option.value)}
                <QItem>
                  <QItemSection type="avatar">
                    <QRadio
                      name="list-options"
                      value={option.value}
                      bind:selected={radioListValue}
                      aria-label={option.label}
                    />
                  </QItemSection>
                  <QItemSection>
                    {#snippet headline()}
                      {option.label}
                    {/snippet}
                    {#snippet line1()}
                      {option.description}
                    {/snippet}
                  </QItemSection>
                </QItem>
              {/each}
            </QList>
          </div>

          <div class="col-12 col-md-6">
            <div class="title-medium q-mb-sm">Whole item</div>
            <QList bordered aria-label="Choose an option using the whole item">
              {#each listOptions as option (option.value)}
                <QItem clickable onclick={() => (itemListValue = option.value)}>
                  <QItemSection type="avatar">
                    <QRadio
                      name="item-options"
                      value={option.value}
                      bind:selected={itemListValue}
                      aria-label={option.label}
                      onclick={stopPropagation}
                    />
                  </QItemSection>
                  <QItemSection>
                    {#snippet headline()}
                      {option.label}
                    {/snippet}
                    {#snippet line1()}
                      {option.description}
                    {/snippet}
                  </QItemSection>
                </QItem>
              {/each}
            </QList>
          </div>
        </div>
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
                name="programming-language"
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
            name="event-options"
            value="event-option1"
            bind:selected={eventSelectedValue}
            label="Option with event handler"
            onchange={() => alert(`Changed to: ${eventSelectedValue}`)}
          />
          <QRadio
            class="q-ma-sm"
            name="event-options"
            value="event-option2"
            bind:selected={eventSelectedValue}
            label="Another option"
            onchange={() => alert(`Changed to: ${eventSelectedValue}`)}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          Give each group a shared <code>name</code> and an accessible label. Tab enters or leaves the
          group. Arrow keys move focus and immediately select the new option; Space selects the focused
          option, while Enter has no native radio action.
        {/snippet}

        <div class="q-pa-md">
          <div id="notification-method-label" class="text-subtitle1 q-mb-md">
            Notification method
          </div>
          <div
            class="flex column q-gap-md"
            role="radiogroup"
            aria-labelledby="notification-method-label"
          >
            <QRadio
              name="notification-method"
              value="email"
              bind:selected={notificationMethod}
              label="Email"
            />
            <QRadio
              name="notification-method"
              value="push"
              bind:selected={notificationMethod}
              label="Push notification"
            />
            <QRadio
              name="notification-method"
              value="none"
              bind:selected={notificationMethod}
              label="None"
            />
          </div>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
