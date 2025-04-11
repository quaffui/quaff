<script lang="ts">
  import { QCheckbox, QBtn, QList, QItem, QItemSection, QIcon } from "$lib";
  import { QCheckboxDocs } from "$lib/components/checkbox/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";

  import snippets from "./docs.snippets";

  let value1 = false;
  let value2 = true;
  let value3 = false;
</script>

<QDocs {snippets} componentDocs={QCheckboxDocs}>
  {#snippet display()}
    <QCheckbox label="I agree to the terms and conditions" bind:value={value1} />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default Checkboxes">
        {#snippet sectionDescription()}
          QCheckbox is a customizable checkbox component that supports binding, labels, and various
          states. It's fully accessible and easy to use in forms or standalone.
        {/snippet}

        <QCheckbox class="q-ma-sm" bind:value={value1} />
        <QCheckbox class="q-ma-sm" label="With label" bind:value={value1} />
      </QDocsSection>

      <QDocsSection title="Checkbox States">
        {#snippet sectionDescription()}
          Checkboxes can be in different states: unchecked, checked, or disabled. The state is
          controlled by the `value` prop for checked/unchecked and the `disable` prop for disabled
          state.
        {/snippet}

        <QCheckbox class="q-ma-sm" label="Unchecked by default" bind:value={value3} />
        <QCheckbox class="q-ma-sm" label="Checked by default" bind:value={value2} />
        <QCheckbox class="q-ma-sm" label="Disabled unchecked" value={false} disable />
        <QCheckbox class="q-ma-sm" label="Disabled checked" value={true} disable />
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QCheckbox supports Svelte's two-way binding with the `bind:value` directive. The example
          below shows how the checkbox state updates the bound variable and vice versa.
        {/snippet}

        <div class="flex items-center q-gap-md q-ma-sm">
          <QCheckbox label="Toggle me" bind:value={value1} />
          <span>Current value: {value1 ? "Checked" : "Unchecked"}</span>
          <QBtn size="sm" label="Toggle programmatically" onclick={() => (value1 = !value1)} />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          QCheckbox is designed with accessibility in mind. It includes proper ARIA attributes and
          can be navigated and toggled using keyboard controls.
        {/snippet}

        <div class="row q-ma-sm">
          <QCheckbox
            class="col-4"
            label="Accessible checkbox (try using keyboard)"
            bind:value={value3}
          />
          <div class="col-8">
            <QList dense>
              <QItem>
                <QItemSection type="avatar">
                  <QIcon name="chevron_right" />
                </QItemSection>
                <QItemSection>Tab: Focus the checkbox</QItemSection>
              </QItem>
              <QItem>
                <QItemSection type="avatar">
                  <QIcon name="chevron_right" />
                </QItemSection>
                <QItemSection>Space: Toggle the checkbox state</QItemSection>
              </QItem>
            </QList>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Event Handling">
        {#snippet sectionDescription()}
          You can attach event handlers to QCheckbox to perform actions when the checkbox state
          changes.
        {/snippet}

        <QCheckbox
          class="q-ma-sm"
          label="Click me"
          bind:value={value3}
          onchange={() => alert(`Checkbox is now ${value3 ? "checked" : "unchecked"}`)}
        />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
