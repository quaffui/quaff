<script lang="ts">
  import { resolve } from "$app/paths";
  import { QExpansionItemDocs } from "$components/expansion-item/docs";
  import {
    QBtn,
    QCheckbox,
    QExpansionItem,
    QIcon,
    QItemSection,
    QList,
    QSelect,
    QSwitch,
  } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QExpansionItem — Accordion",
      "Reveal details with QExpansionItem for Svelte. Build accordions, exclusive groups, and expandable lists with custom summaries and separate link actions."
    )
  );

  const REPAIRS = [
    {
      label: "Jacket pocket",
      icon: "apparel",
      detail: "Match the thread and reinforce the loose corner.",
    },
    {
      label: "Bicycle bell",
      icon: "pedal_bike",
      detail: "Clean the lever before checking its spring.",
    },
    {
      label: "Picture frame",
      icon: "photo",
      detail: "Square the corners and replace the backing.",
    },
  ] as const;
  const ICON_PRESETS = {
    Chevron: { expandIcon: "keyboard_arrow_down" },
    "Plus / minus": { expandIcon: "add", expandedIcon: "remove" },
    Stationary: { expandIcon: "handyman", noRotateExpandIcon: true },
    Hidden: { hideExpandIcon: true },
  } as const;
  const ICON_OPTIONS = Object.keys(ICON_PRESETS);
  const DURATIONS = [
    { label: "Default", value: "default" },
    { label: "150 ms", value: "150" },
    { label: "800 ms", value: "800" },
  ];

  let noRipple = $state(false);
  let isExclusive = $state(true);
  let expressive = $state(true);
  let isSegmented = $state(true);
  let dense = $state(false);
  let iconStyle = $state<keyof typeof ICON_PRESETS>("Chevron");
  let duration = $state("default");
  let isPanelOpen = $state(false);
  let isPrepared = $state(false);
  let repairItem = $state<ReturnType<typeof QExpansionItem>>();
  let lastChange = $state("No state changes yet.");
  let detailsClicks = $state(0);

  const iconPreset = $derived({
    expandIcon: "keyboard_arrow_down",
    expandedIcon: undefined,
    noRotateExpandIcon: false,
    hideExpandIcon: false,
    ...ICON_PRESETS[iconStyle],
  } as const);
  const animationDuration = $derived(duration === "default" ? undefined : Number(duration));

  docsCtx.set({ snippets, componentDocs: QExpansionItemDocs });
</script>

<QDocs>
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The preview scrolls when text is enlarged.) -->
    <div
      class="expansion-preview min-width-0 overflow-auto surface-container-low"
      role="region"
      aria-label="Repair notes preview"
      tabindex="0"
    >
      <h2 class="title-large q-mt-none q-mb-md">Repair notes</h2>
      <QList role="group" expressive segmented aria-label="Repair notes">
        <QExpansionItem label="Jacket pocket" caption="Loose seam" icon="apparel" defaultOpened>
          <div class="panel-copy q-px-md q-pt-sm q-pb-md">
            <p class="q-ma-none">Match the thread and reinforce the loose corner.</p>
          </div>
        </QExpansionItem>
        <QExpansionItem label="Bicycle bell" caption="Sticking lever" icon="pedal_bike">
          <div class="panel-copy q-px-md q-pt-sm q-pb-md">
            <p class="q-ma-none">Clean the lever before checking its spring.</p>
          </div>
        </QExpansionItem>
      </QList>
    </div>
  {/snippet}

  {#snippet usage()}
    <div class="expansion-usage">
      <QDocsSection title="Basic Disclosure">
        {#snippet sectionDescription()}
          Place expansion items inside <code>QList</code>. The whole header opens the panel by
          default. Add an <code>icon</code> and <code>caption</code>, start open with
          <code>defaultOpened</code>, or make a row unavailable with <code>disabled</code>.
        {/snippet}

        <div class="expansion-example full-width min-width-0">
          <div class="example-controls flex q-gap-x-lg q-my-md">
            <QSwitch label="Disable ripple" bind:value={noRipple} />
          </div>
          <QList role="group" expressive={false} bordered separator aria-label="Basic repair notes">
            <QExpansionItem
              label="Jacket pocket"
              caption="Loose seam"
              icon="apparel"
              defaultOpened
              {noRipple}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Match the thread and reinforce the loose corner.</p>
              </div>
            </QExpansionItem>
            <QExpansionItem
              label="Bicycle bell"
              caption="Sticking lever"
              icon="pedal_bike"
              {noRipple}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Clean the lever before checking its spring.</p>
              </div>
            </QExpansionItem>
            <QExpansionItem label="Reading lamp" caption="Not available" icon="lightbulb" disabled>
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Electrical repairs require a qualified volunteer.</p>
              </div>
            </QExpansionItem>
          </QList>
        </div>
      </QDocsSection>

      <QDocsSection title="Exclusive Groups">
        {#snippet sectionDescription()}
          Items with the same <code>name</code> close one another when opened. Groups are scoped to
          their containing <code>QList</code>: these two lists share a name but expand
          independently. Remove the name to allow multiple open panels.
        {/snippet}

        <div class="example-controls flex q-gap-x-lg q-my-md">
          <QSwitch label="Exclusive groups" bind:value={isExclusive} />
        </div>
        <div class="group-grid q-gap-lg">
          <div class="min-width-0">
            <h3 class="title-medium">Repairs</h3>
            <QList role="group" expressive segmented aria-label="Grouped repairs">
              {#each REPAIRS as repair, index (repair.label)}
                <QExpansionItem
                  label={repair.label}
                  icon={repair.icon}
                  name={isExclusive ? "repairs" : undefined}
                  defaultOpened={index === 0}
                >
                  <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                    <p class="q-ma-none">{repair.detail}</p>
                  </div>
                </QExpansionItem>
              {/each}
            </QList>
          </div>
          <div class="min-width-0">
            <h3 class="title-medium">Materials</h3>
            <QList role="group" expressive segmented aria-label="Grouped materials">
              <QExpansionItem
                label="Thread"
                icon="palette"
                name={isExclusive ? "repairs" : undefined}
                defaultOpened
              >
                <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                  <p class="q-ma-none">Choose a matching colour and medium-weight thread.</p>
                </div>
              </QExpansionItem>
              <QExpansionItem
                label="Backing board"
                icon="crop_square"
                name={isExclusive ? "repairs" : undefined}
              >
                <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                  <p class="q-ma-none">Cut a backing board to the frame's inside dimensions.</p>
                </div>
              </QExpansionItem>
            </QList>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Appearance and Icons">
        {#snippet sectionDescription()}
          The containing list supplies expressive styling, segmentation and density. Change the
          disclosure icon or its motion independently. <code>duration</code> is in milliseconds; the default
          is 300 in standard lists and 350 in expressive lists.
        {/snippet}

        <div class="expansion-example full-width min-width-0">
          <div class="example-controls flex q-gap-x-lg q-my-md">
            <QSwitch label="Expressive" bind:value={expressive} />
            <QSwitch label="Segmented" bind:value={isSegmented} disabled={!expressive} />
            <QSwitch label="Dense" bind:value={dense} />
          </div>
          <div class="appearance-selects q-gap-md q-my-md">
            <QSelect
              class="min-width-0"
              outlined
              label="Disclosure icon"
              options={ICON_OPTIONS}
              bind:value={iconStyle}
            />
            <QSelect
              class="min-width-0"
              outlined
              label="Animation duration"
              options={DURATIONS}
              bind:value={duration}
              emitValue
            />
          </div>
          <QList
            role="group"
            {expressive}
            segmented={expressive && isSegmented}
            {dense}
            bordered={!expressive}
            separator={!expressive}
            aria-label="Expansion appearance"
          >
            <QExpansionItem
              label="Picture frame"
              caption="Loose corner"
              icon="photo"
              expandIcon={iconPreset.expandIcon}
              expandedIcon={iconPreset.expandedIcon}
              noRotateExpandIcon={iconPreset.noRotateExpandIcon}
              hideExpandIcon={iconPreset.hideExpandIcon}
              duration={animationDuration}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Square the corners before fitting a new backing.</p>
              </div>
            </QExpansionItem>
            <QExpansionItem
              label="Bicycle bell"
              caption="Sticking lever"
              icon="pedal_bike"
              expandIcon={iconPreset.expandIcon}
              expandedIcon={iconPreset.expandedIcon}
              noRotateExpandIcon={iconPreset.noRotateExpandIcon}
              hideExpandIcon={iconPreset.hideExpandIcon}
              duration={animationDuration}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Check the lever and spring after cleaning.</p>
              </div>
            </QExpansionItem>
          </QList>
        </div>
        <p class="body-medium q-mt-md">
          A single <code>expandIcon</code> rotates when open. Pair it with <code>expandedIcon</code>
          to swap glyphs, or use <code>noRotateExpandIcon</code> to keep it still.
          <code>hideExpandIcon</code> hides only the decoration; the whole header remains operable.
        </p>
      </QDocsSection>

      <QDocsSection title="Controlled State and Methods">
        {#snippet sectionDescription()}
          Bind <code>value</code> to application state, or use <code>bind:this</code> to call
          <code>show()</code>, <code>hide()</code> and <code>toggle()</code>.
          <code>ontoggle</code> reports the resulting state for header, binding and method changes. Collapsing
          the panel preserves its controls' state.
        {/snippet}

        <div class="expansion-example full-width min-width-0">
          <div class="example-controls flex q-gap-x-lg q-my-md">
            <QSwitch label="Panel open" bind:value={isPanelOpen} />
            <QBtn outlined label="Show" onclick={() => repairItem?.show()} />
            <QBtn outlined label="Hide" onclick={() => repairItem?.hide()} />
            <QBtn outlined label="Toggle" onclick={() => repairItem?.toggle()} />
          </div>
          <QList role="group" expressive segmented aria-label="Controlled repair note">
            <QExpansionItem
              bind:this={repairItem}
              bind:value={isPanelOpen}
              label="Repair checklist"
              icon="checklist"
              ontoggle={(event) => (lastChange = `Panel ${event.newState}.`)}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <QCheckbox label="Tools packed" bind:value={isPrepared} />
              </div>
            </QExpansionItem>
          </QList>
          <p class="example-status body-medium q-mt-md q-mb-none" role="status">
            {lastChange} Checkbox: {isPrepared ? "checked" : "unchecked"}.
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Summary">
        {#snippet sectionDescription()}
          The <code>summary</code> snippet receives <code>expanded</code> and the
          <code>show</code>, <code>hide</code> and <code>toggle</code> helpers. Compose its layout
          with <code>QItemSection</code>. Keep the summary non-interactive: the component supplies
          the disclosure action.
        {/snippet}

        <div class="expansion-example full-width min-width-0">
          <QList role="group" expressive segmented aria-label="Custom repair summary">
            <QExpansionItem label="Picture frame">
              {#snippet summary({ expanded })}
                <QItemSection type="icon"><QIcon name="photo" aria-hidden="true" /></QItemSection>
                <QItemSection>
                  {#snippet headline()}Picture frame{/snippet}
                  {#snippet line1()}Loose corner · Woodwork{/snippet}
                  {#snippet line2()}{expanded
                      ? "Repair notes expanded"
                      : "Repair notes collapsed"}{/snippet}
                </QItemSection>
              {/snippet}
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Keep the original frame and replace the damaged backing.</p>
              </div>
            </QExpansionItem>
          </QList>
        </div>
      </QDocsSection>

      <QDocsSection title="Links and Separate Toggles">
        {#snippet sectionDescription()}
          With <code>to</code> or <code>href</code>, the title navigates while a separate trailing
          button opens the panel. <code>expandIconToggle</code> gives a non-linked row the same
          separate control. The event count below tracks only <code>onExpandIconClick</code>.
        {/snippet}

        <div class="expansion-example full-width min-width-0">
          <QList
            role="group"
            expressive={false}
            bordered
            separator
            aria-label="Linked repair notes"
          >
            <QExpansionItem
              label="Repair materials"
              caption="to: jump to the materials note"
              icon="inventory_2"
              to="#repair-materials"
              toggleAriaLabel="Toggle repair materials details"
              expandIcon="add"
              expandedIcon="remove"
              onExpandIconClick={() => (detailsClicks += 1)}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Read the note below for the material list.</p>
              </div>
            </QExpansionItem>
            <QExpansionItem
              label="Repair tools"
              caption="href: jump to the tools note"
              icon="handyman"
              href="#repair-tools"
              toggleAriaLabel="Toggle repair tools details"
              onExpandIconClick={() => (detailsClicks += 1)}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Read the note below for the tool list.</p>
              </div>
            </QExpansionItem>
            <QExpansionItem
              label="Storage note"
              caption="Only the trailing button expands"
              icon="shelves"
              expandIconToggle
              toggleAriaLabel="Toggle storage note"
              onExpandIconClick={() => (detailsClicks += 1)}
            >
              <div class="panel-copy q-px-md q-pt-sm q-pb-md">
                <p class="q-ma-none">Keep small parts together in a labelled container.</p>
              </div>
            </QExpansionItem>
          </QList>
          <p class="example-status body-medium q-mt-md q-mb-none" role="status">
            Separate toggle activations: {detailsClicks}.
          </p>
          <section
            class="link-target border q-mt-lg q-pa-md"
            id="repair-materials"
            aria-label="Repair materials note"
          >
            <h3 class="title-medium q-mt-none q-mb-sm">Materials</h3>
            <p class="q-ma-none">Matching thread and a backing board.</p>
          </section>
          <section
            class="link-target border q-mt-lg q-pa-md"
            id="repair-tools"
            aria-label="Repair tools note"
          >
            <h3 class="title-medium q-mt-none q-mb-sm">Tools</h3>
            <p class="q-ma-none">A needle, screwdriver and corner clamp.</p>
          </section>
        </div>
        <p class="body-medium q-mt-md">
          Set <code>toggleAriaLabel</code> to identify the separate button; its default label
          reflects the open state. Even with <code>hideExpandIcon</code>, separate buttons stay
          visible so the panel remains operable.
        </p>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        <p>
          Enter and Space toggle a focused whole-row header. Tab enters the list; arrow keys move
          through its rows and separate actions. Use <code>preserveTabOrder</code> on the list if every
          header should be a Tab stop. Collapsed panels keep their state, but their content is hidden
          from assistive technology and keyboard navigation.
        </p>
        <p>
          Keep <code>selection</code> off a list of expansion items: these are disclosures, not
          listbox options. See
          <a class="q-docs-link" href={resolve("/components/list", {})}>QList</a>
          for keyboard and layout options.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }

  .expansion-preview {
    width: min(100%, 420px);
    max-height: 100%;
    padding: 20px;
    border-radius: 24px;
  }

  .expansion-usage :global(.q-docs-section__header h5) {
    overflow-wrap: anywhere;
  }

  .expansion-example {
    max-width: 640px;
  }

  .panel-copy {
    overflow-wrap: anywhere;
  }

  .example-controls {
    row-gap: 12px;
  }

  .example-controls :global(.q-switch) {
    max-width: 100%;
  }

  .group-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    max-width: 960px;
  }

  .group-grid h3 {
    margin-block: 0 12px;
  }

  .appearance-selects {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  }

  .example-status {
    overflow-wrap: anywhere;
  }

  .link-target {
    border-radius: 16px;
    overflow-wrap: anywhere;
    scroll-margin-block-start: 96px;
  }
</style>
