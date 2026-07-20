<script lang="ts">
  import QCard from "$components/card/QCard.svelte";
  import { QCheckboxDocs } from "$components/checkbox/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCheckbox, QIcon, QItem, QItemSection, QList } from "$lib";
  import { QDocs, QDocsSection } from "$docs";

  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QCheckboxDocs });

  let value1 = false;
  let value2 = true;
  let value3 = false;
  let mixedValue = false;
  let indeterminate = true;
</script>

<svelte:head>
  <title>{pageTitle("QCheckbox")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCard>
      <QCheckbox label="I agree to the terms and conditions" bind:value={value1} />
    </QCard>
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
          Checkboxes support checked, unchecked, indeterminate, error, and disabled states. The
          independent <code>indeterminate</code> prop is useful when a group is only partially
          selected. The <code>error</code> prop communicates a validation problem.
        {/snippet}

        <QCheckbox class="q-ma-sm" label="Unchecked by default" bind:value={value3} />
        <QCheckbox class="q-ma-sm" label="Checked by default" bind:value={value2} />
        <QCheckbox
          class="q-ma-sm"
          label="Indeterminate"
          bind:value={mixedValue}
          bind:indeterminate
        />
        <QCheckbox class="q-ma-sm" label="Error unchecked" value={false} error />
        <QCheckbox class="q-ma-sm" label="Error checked" value={true} error />
        <QCheckbox class="q-ma-sm" label="Disabled unchecked" value={false} disabled />
        <QCheckbox class="q-ma-sm" label="Disabled checked" value={true} disabled />
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QCheckbox supports Svelte's two-way binding with the <code>bind:value</code> directive. The
          example below shows how the checkbox state updates the bound variable and vice versa.
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
