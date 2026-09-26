<script lang="ts">
  import { QBtnGroupDocs, QBtnToggleDocs } from "$components/button-group/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QBtnGroup, QBtnToggle, QIconBtn } from "$lib";
  import type { QBtnToggleProps } from "$components/button-group/props";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QBtnGroupDocs, QBtnToggleDocs] });

  type ToggleValue = QBtnToggleProps["value"];

  const periods = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];
  const weekdays = [
    { label: "Mon", value: "mon" },
    { label: "Tue", value: "tue" },
    { label: "Wed", value: "wed" },
  ];
  const alignments: QBtnToggleProps["options"] = [
    { icon: "format_align_left", value: "left", "aria-label": "Align left" },
    { icon: "format_align_center", value: "center", "aria-label": "Align center" },
    { icon: "format_align_right", value: "right", "aria-label": "Align right" },
  ];
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const heights = { xs: 32, sm: 40, md: 56, lg: 96, xl: 136 };

  let baseline = $state<ToggleValue>("day");
  let period = $state<ToggleValue>("week");
  let days = $state<ToggleValue>(["mon", "wed"]);
  let optional = $state<ToggleValue>("day");
  let alignment = $state<ToggleValue>("left");
  let action = $state("Choose an action");
</script>

<svelte:head>
  <title>{pageTitle("Button groups")}</title>
</svelte:head>

<QDocs
  docName="Button groups"
  docDescription="Group related actions or choose options with Material 3 button groups and segmented buttons."
>
  {#snippet display()}
    <div style="width: min(448px, 100%);">
      <QBtnToggle expressive options={periods} value="week" aria-label="Preview period" />
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Baseline Segmented Buttons">
      {#snippet sectionDescription()}
        <p>
          With <code>{"expressive={false}"}</code>, groups use the baseline Material 3 connected
          style at 40px high. <code>QBtnToggle</code> manages selection from an <code>options</code>
          array; bind <code>value</code> to read and update the choice.
        </p>
        <p>
          Both components inherit the global <code>{"Quaff.init({ expressive: true })"}</code>
          setting unless you pass <code>expressive</code> explicitly. Baseline groups remain
          connected regardless of the <code>connected</code> prop.
        </p>
      {/snippet}

      <div style="max-width: 32rem;">
        <QBtnToggle
          expressive={false}
          options={periods}
          bind:value={baseline}
          aria-label="Calendar view"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Standard Action Groups">
      {#snippet sectionDescription()}
        <p>
          An expressive <code>QBtnGroup</code> uses separate buttons by default. Place
          <code>QBtn</code> and <code>QIconBtn</code> directly inside it; each button keeps its own action
          and visual variant. The group shares size, shape, and disabled state with its buttons.
        </p>
      {/snippet}

      <QBtnGroup expressive role="group" aria-label="Message actions">
        <QBtn label="Send" icon="send" filled onclick={() => (action = "Message sent")} />
        <QBtn label="Save draft" tonal onclick={() => (action = "Draft saved")} />
        <QIconBtn
          icon="delete"
          variant="outlined"
          aria-label="Delete draft"
          onclick={() => (action = "Draft deleted")}
        />
      </QBtnGroup>
      <p class="q-mt-md" aria-live="polite">{action}</p>
    </QDocsSection>

    <QDocsSection title="Connected Selection">
      {#snippet sectionDescription()}
        <p>
          <code>QBtnToggle</code> is connected by default. Expressive connected groups use narrow
          gaps and changing shapes to show interaction and selection. Options need a unique string
          or number <code>value</code> and a label, icon, or both.
        </p>
        <p>
          Select one option by default, or use <code>multiple</code> with an array of values. The
          default expressive variant is <code>tonal</code>; <code>filled</code>,
          <code>outlined</code>, and <code>elevated</code> are also available.
        </p>
      {/snippet}

      <div class="flex column q-gap-lg" style="max-width: 32rem;">
        <QBtnToggle
          expressive
          options={periods}
          bind:value={period}
          aria-label="Reporting period"
        />
        <QBtnToggle
          expressive
          multiple
          options={weekdays}
          bind:value={days}
          aria-label="Repeat on weekdays"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Required and Optional Selection">
      {#snippet sectionDescription()}
        <p>
          By default, a selected single option cannot be cleared; multiple selection allows an empty
          array. Set <code>clearable</code> to allow an empty single selection, represented by
          <code>undefined</code>, or <code>{"clearable={false}"}</code> to keep the final selected
          option in a multiple group. Initialize <code>value</code> with a valid selection when a choice
          is required.
        </p>
        <p>
          Set <code>{"connected={false}"}</code> for an expressive standard selection group. This example
          allows you to select an option and click it again to clear it.
        </p>
      {/snippet}

      <QBtnToggle
        expressive
        connected={false}
        clearable
        options={periods}
        bind:value={optional}
        aria-label="Optional period"
      />
      <p class="q-mt-md">Selected: {optional ?? "None"}</p>
    </QDocsSection>

    <QDocsSection title="Expressive Sizes">
      {#snippet sectionDescription()}
        Expressive groups support <code>xs</code>, <code>sm</code>, <code>md</code>,
        <code>lg</code>, and <code>xl</code>, with <code>sm</code> as the default. All members share the
        group size. Large examples can be scrolled horizontally.
      {/snippet}

      <div class="flex column q-gap-lg">
        {#each sizes as size (size)}
          <div class="group-size-example">
            <p class="q-mb-sm">{size.toUpperCase()} · {heights[size]}px</p>
            <div class="group-example-scroll">
              <QBtnGroup expressive {size} role="group" aria-label={`${size} actions`}>
                <QBtn label="Edit" icon="edit" filled />
                <QBtn label="Share" icon="share" tonal />
              </QBtnGroup>
            </div>
          </div>
        {/each}
      </div>
    </QDocsSection>

    <QDocsSection title="Shapes and Width">
      {#snippet sectionDescription()}
        <p>
          Expressive groups support <code>shape="round"</code> (the default) and
          <code>shape="squared"</code>. Expressive connected groups fill the available width by
          default. Standard groups and baseline segmented buttons fit their contents. Use
          <code>spread</code> to override this.
        </p>
      {/snippet}

      <div class="flex column q-gap-lg" style="max-width: 32rem;">
        <QBtnToggle
          expressive
          shape="round"
          options={periods}
          value="day"
          aria-label="Round group"
        />
        <QBtnToggle
          expressive
          shape="squared"
          spread={false}
          options={periods}
          value="week"
          aria-label="Compact squared group"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Disabled and Icon-only Options">
      {#snippet sectionDescription()}
        <p>
          Set <code>disabled</code> on a group to disable every button, or on an option to disable
          that option. Give icon-only options an <code>aria-label</code> describing their action.
        </p>
      {/snippet}

      <div class="flex column q-gap-lg" style="max-width: 32rem;">
        <QBtnToggle
          expressive
          options={alignments}
          bind:value={alignment}
          aria-label="Text alignment"
        />
        <QBtnToggle
          expressive
          options={[
            { label: "Day", value: "day" },
            { label: "Week", value: "week", disabled: true },
            { label: "Month", value: "month" },
          ]}
          value="day"
          aria-label="Available periods"
        />
        <QBtnToggle
          expressive
          disabled
          options={periods}
          value="day"
          aria-label="Disabled periods"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Keyboard and Accessibility" noCode>
      {#snippet sectionDescription()}
        <p>
          Each enabled button is a Tab stop. Space and Enter activate the focused button, and
          selection is announced through <code>aria-pressed</code>. The group container is not a
          focus stop. Keep button labels stable when selection changes.
        </p>
        <p>
          See the Material 3 guidance for
          <a class="q-docs-link" href="https://m3.material.io/components/button-groups/overview"
            >button groups</a
          >
          and
          <a class="q-docs-link" href="https://m3.material.io/components/segmented-buttons/overview"
            >segmented buttons</a
          >.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .group-size-example {
    min-width: 0;
    width: 100%;
  }

  .group-example-scroll {
    max-width: 100%;
    overflow-x: auto;
    padding: 8px;
  }
</style>
