<script lang="ts">
  import { tick } from "svelte";
  import { asset } from "$app/paths";
  import { QItemDocs, QItemSectionDocs, QListDocs } from "#components/list/docs.js";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { pageMeta } from "#docs/metadata.js";
  import {
    QAvatar,
    QCheckbox,
    QIcon,
    QIconBtn,
    QInput,
    QItem,
    QItemSection,
    QList,
    QRadio,
    QSwitch,
  } from "#lib";
  import { QDocs, QDocsSection } from "#docs";
  import { useMeta } from "#lib/meta.js";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QList — Lists & Items",
      "Build Material 3 lists in Svelte with QList and QItem. Explore icons, avatars, selection, multiple actions, expressive styles, and multiline content."
    )
  );

  const BAR_AREAS = [
    {
      id: "counter",
      label: "Counter",
      description: "A seat by the bar",
      icon: "local_bar",
      color: "secondary-container",
    },
    {
      id: "window",
      label: "Window seats",
      description: "A quiet corner for two",
      icon: "window",
      color: "tertiary-container",
    },
    {
      id: "terrace",
      label: "Terrace",
      description: "Fresh air and room for four",
      icon: "deck",
      color: "primary-container",
    },
  ] as const;
  const BOOKING_TIMES = ["18:00", "19:00", "20:00"] as const;
  const TABLE_REQUESTS = ["Water for the table", "Extra napkins", "Printed menu"] as const;
  const INITIAL_TASKS = [
    "Clear the counter",
    "Refill the water station",
    "Set out the menus",
  ] as const;

  docsCtx.set({ snippets, componentDocs: [QListDocs, QItemDocs, QItemSectionDocs] });

  let expressive = $state(true);
  let segmented = $state(true);
  let dense = $state(false);
  let bordered = $state(false);
  let noRound = $state(false);
  let padding = $state(false);
  let separator = $state(false);
  let inset = $state(false);
  let shouldShowSave = $state(true);
  let savedAreaIds = $state<string[]>(["window"]);
  let lastAction = $state("None");
  let bookingTime = $state<string>("19:00");
  let tableRequests = $state<string[]>(["Water for the table"]);
  let noRipple = $state(false);
  let shouldUseControls = $state(true);
  let shouldToggleWholeRow = $state(false);
  let shouldReceiveReminder = $state(true);
  let bookingName = $state("Robin");
  let tasks = $state<string[]>([...INITIAL_TASKS]);
  let draggedTask = $state<string>();
  let taskStatus = $state("Current task order.");

  function setSavedArea(id: string, isSelected: boolean) {
    savedAreaIds = isSelected
      ? [...savedAreaIds, id]
      : savedAreaIds.filter((entry) => entry !== id);
  }

  function setTableRequest(request: string, isSelected: boolean) {
    tableRequests = isSelected
      ? [...tableRequests, request]
      : tableRequests.filter((entry) => entry !== request);
  }

  function activateRowControl(event: MouseEvent & { currentTarget: HTMLElement }) {
    if (!(event.target instanceof Element) || event.target.closest("label")) {
      return;
    }

    const input = event.currentTarget.querySelector("input");

    if (!input || input.disabled) {
      return;
    }

    input.focus({ preventScroll: true });
    input.click();
  }

  function moveTask(task: string, before: string) {
    if (task === before) {
      return;
    }

    const reordered = tasks.filter((entry) => entry !== task);
    reordered.splice(reordered.indexOf(before), 0, task);
    tasks = reordered;
    taskStatus = task + " moved to position " + (tasks.indexOf(task) + 1) + ".";
  }

  async function prioritizeTask(task: string, button: HTMLElement) {
    moveTask(task, tasks[0]);
    await tick();
    button.focus();
  }

  function dropTask(event: DragEvent, before: string) {
    event.preventDefault();

    if (draggedTask) {
      moveTask(draggedTask, before);
      draggedTask = undefined;
    }
  }
</script>

<QDocs>
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The preview can scroll with enlarged text.) -->
    <div
      class="list-preview surface-container-low overflow-auto q-pa-md"
      role="region"
      aria-label="Bar seating preview"
      tabindex="0">
      <h2 class="title-medium">At the bar</h2>
      <QList expressive segmented role="list" aria-label="Seating areas">
        {#each BAR_AREAS as area (area.id)}
          <QItem role="listitem">
            <QItemSection type="avatar">
              <QAvatar class={area.color} aria-hidden="true">
                <QIcon name={area.icon} />
              </QAvatar>
            </QItemSection>
            <QItemSection>
              {area.label}
              {#snippet line1()}{area.description}{/snippet}
            </QItemSection>
          </QItem>
        {/each}
      </QList>
    </div>
  {/snippet}

  {#snippet usage()}
    <div class="list-usage">
      <QDocsSection title="Basic List">
        {#snippet sectionDescription()}
          <code>QList</code> contains rows of <code>QItem</code>; each
          <code>QItemSection</code> holds the content of a row. Start with a single section for a simple
          text list, then add icons, supporting text or actions as needed.
        {/snippet}

        <div class="list-example full-width min-width-0">
          <QList bordered expressive={false} role="list" aria-label="Bar facilities">
            <QItem role="listitem"><QItemSection>Table service</QItemSection></QItem>
            <QItem role="listitem"><QItemSection>Step-free entrance</QItemSection></QItem>
            <QItem role="listitem"><QItemSection>Outdoor seating</QItemSection></QItem>
          </QList>
        </div>

        <p class="body-medium">
          Lists and items render as <code>div</code> elements by default; this example adds
          <code>list</code> and <code>listitem</code> roles. Use <code>tag</code> for other HTML
          elements, such as <code>ul</code> and <code>li</code>.
        </p>
      </QDocsSection>

      <QDocsSection title="Appearance">
        {#snippet sectionDescription()}
          Compare one-, two- and three-line rows. <code>segmented</code> adds gaps between
          expressive items; <code>dense</code> reduces row height. This preview keeps borders, padding
          and separators in baseline mode: turn off Expressive to try them.
        {/snippet}

        <div class="list-example full-width min-width-0">
          <div class="flex q-gap-md q-mb-lg">
            <QSwitch label="Expressive" bind:value={expressive} />
            <QSwitch label="Segmented" bind:value={segmented} disabled={!expressive} />
            <QSwitch label="Dense" bind:value={dense} />
            {#if !expressive}
              <QSwitch label="Bordered" bind:value={bordered} />
              <QSwitch label="Square outer corners" bind:value={noRound} disabled={!bordered} />
              <QSwitch label="List padding" bind:value={padding} />
              <QSwitch label="Separators" bind:value={separator} />
              <QSwitch label="Inset separators" bind:value={inset} disabled={!separator} />
            {/if}
          </div>
          <QList
            class={expressive ? "surface-container-low" : undefined}
            {expressive}
            segmented={expressive && segmented}
            {dense}
            bordered={!expressive && bordered}
            noRound={!expressive && bordered && noRound}
            padding={!expressive && padding}
            separator={!expressive && separator}
            separatorOptions={{ inset }}
            role="list"
            aria-label="List appearance preview">
            <QItem role="listitem">
              <QItemSection type="icon">
                <QIcon name="door_open" aria-hidden="true" />
              </QItemSection>
              <QItemSection>Doors open</QItemSection>
              <QItemSection type="trailingText">17:00</QItemSection>
            </QItem>
            <QItem role="listitem">
              <QItemSection type="icon">
                <QIcon name="piano" aria-hidden="true" />
              </QItemSection>
              <QItemSection>
                Live piano
                {#snippet line1()}A short set by the window{/snippet}
              </QItemSection>
              <QItemSection type="trailingText">18:00</QItemSection>
            </QItem>
            <QItem role="listitem">
              <QItemSection type="icon">
                <QIcon name="quiz" aria-hidden="true" />
              </QItemSection>
              <QItemSection>
                Evening quiz
                {#snippet line1()}Teams of up to four{/snippet}
                {#snippet line2()}Sign up at the counter{/snippet}
              </QItemSection>
              <QItemSection type="trailingText">19:30</QItemSection>
            </QItem>
          </QList>
        </div>

        <p class="body-medium">
          An individual <code>QItem dense</code> also opts into compact spacing; it cannot undo
          <code>dense</code> on its list. <code>expressive</code> inherits
          <code>Quaff.init({`{ expressive: true }`})</code> when omitted; set
          <code>{"expressive={false}"}</code> to use standard styling. Inside <code>QMenu</code>,
          lists use menu styling unless <code>expressive</code> is explicitly set.
        </p>
      </QDocsSection>

      <QDocsSection title="Multiple Actions">
        {#snippet sectionDescription()}
          For one action on the whole row, use <code>QItem clickable</code> with an
          <code>onclick</code> handler. For independent actions, keep the item non-clickable and put
          <code>action</code>
          on the content section to render a native button. Its
          <code>leading</code> snippet includes the avatar in the same target.
        {/snippet}

        <div class="list-example full-width min-width-0">
          <div class="q-mb-lg">
            <QSwitch label="Show save actions" bind:value={shouldShowSave} />
          </div>
          <QList expressive segmented role="list" aria-label="Seating area actions">
            {#each BAR_AREAS as area (area.id)}
              <QItem role="listitem">
                <QItemSection action onclick={() => (lastAction = "View " + area.label)}>
                  {#snippet leading()}
                    <QAvatar class={area.color} aria-hidden="true">
                      <QIcon name={area.icon} />
                    </QAvatar>
                  {/snippet}
                  {area.label}
                  {#snippet line1()}{area.description}{/snippet}
                </QItemSection>
                {#if shouldShowSave}
                  <QItemSection type="side">
                    <QIconBtn
                      icon="favorite"
                      variant="tonal"
                      aria-label={"Save " + area.label}
                      bind:selected={
                        () => savedAreaIds.includes(area.id),
                        (isSelected) => setSavedArea(area.id, isSelected)
                      } />
                  </QItemSection>
                {/if}
              </QItem>
            {/each}
          </QList>
          <p class="example-status body-medium q-mt-md q-mb-none" role="status">
            Last primary action: {lastAction}. Saved areas: {savedAreaIds.length}.
          </p>
        </div>

        <p class="body-medium">
          By default the list has one Tab stop. Arrow keys cycle through available row actions; Tab
          leaves the list. Keep a conditional action's entire <code>QItemSection</code> inside the conditional
          block so keyboard navigation updates when it is added or removed.
        </p>
      </QDocsSection>

      <QDocsSection title="Selection">
        {#snippet sectionDescription()}
          Choose between native form controls and selectable rows. <code>QRadio</code> and
          <code>QCheckbox</code> use real inputs; <code>preserveTabOrder</code> keeps their keyboard
          behavior. Turn off the controls to try <code>selection="single"</code> and
          <code>selection="multiple"</code> listboxes with clickable options.
        {/snippet}

        <div class="flex q-gap-md q-mb-lg">
          <QSwitch label="Use checkbox and radio controls" bind:value={shouldUseControls} />
          <QSwitch
            label="Click anywhere in the row"
            bind:value={
              () => !shouldUseControls || shouldToggleWholeRow,
              (isEnabled) => (shouldToggleWholeRow = isEnabled)
            }
            disabled={!shouldUseControls} />
          <QSwitch
            label="Disable item ripples"
            bind:value={noRipple}
            disabled={shouldUseControls} />
        </div>
        <div id="booking-selection" class="selection-grid q-gap-lg">
          <div class="min-width-0">
            <h3 class="title-medium">Booking time</h3>
            <QList
              selection={shouldUseControls ? undefined : "single"}
              preserveTabOrder={shouldUseControls}
              role={shouldUseControls ? "radiogroup" : undefined}
              aria-label="Booking time"
              expressive
              segmented>
              {#each BOOKING_TIMES as time (time)}
                {#if shouldUseControls}
                  <QItem
                    class={shouldToggleWholeRow && time !== "20:00" ? "cursor-pointer" : undefined}
                    onclick={shouldToggleWholeRow ? activateRowControl : undefined}>
                    <QItemSection>
                      <QRadio
                        class="full-width"
                        name="bar-booking-time"
                        value={time}
                        bind:selected={bookingTime}
                        label={time === "20:00" ? "20:00 · Already booked" : time}
                        disabled={time === "20:00"} />
                    </QItemSection>
                  </QItem>
                {:else}
                  <QItem
                    clickable
                    active={bookingTime === time}
                    disabled={time === "20:00"}
                    {noRipple}
                    onclick={() => (bookingTime = time)}>
                    <QItemSection type="icon">
                      <QIcon
                        name={bookingTime === time
                          ? "radio_button_checked"
                          : "radio_button_unchecked"}
                        aria-hidden="true" />
                    </QItemSection>
                    <QItemSection>
                      {time}
                      {#snippet line1()}
                        {time === "20:00" ? "Already booked" : "A table for one hour"}
                      {/snippet}
                    </QItemSection>
                  </QItem>
                {/if}
              {/each}
            </QList>
          </div>
          <div class="min-width-0">
            <h3 class="title-medium">Table requests</h3>
            <QList
              selection={shouldUseControls ? undefined : "multiple"}
              preserveTabOrder={shouldUseControls}
              role={shouldUseControls ? "group" : undefined}
              aria-label="Table requests"
              expressive
              segmented>
              {#each TABLE_REQUESTS as request (request)}
                {#if shouldUseControls}
                  <QItem
                    class={shouldToggleWholeRow ? "cursor-pointer" : undefined}
                    onclick={shouldToggleWholeRow ? activateRowControl : undefined}>
                    <QItemSection>
                      <QCheckbox
                        class="full-width"
                        label={request}
                        bind:value={
                          () => tableRequests.includes(request),
                          (isSelected) => setTableRequest(request, isSelected)
                        } />
                    </QItemSection>
                  </QItem>
                {:else}
                  <QItem
                    clickable
                    active={tableRequests.includes(request)}
                    {noRipple}
                    onclick={() => setTableRequest(request, !tableRequests.includes(request))}>
                    <QItemSection type="icon">
                      <QIcon
                        name={tableRequests.includes(request)
                          ? "check_box"
                          : "check_box_outline_blank"}
                        aria-hidden="true" />
                    </QItemSection>
                    <QItemSection>{request}</QItemSection>
                  </QItem>
                {/if}
              {/each}
            </QList>
          </div>
        </div>
        <p class="example-status body-medium q-mt-md q-mb-none" role="status">
          Booking time: {bookingTime}. Requests selected: {tableRequests.length} of {TABLE_REQUESTS.length}.
        </p>
        <p class="body-medium">
          The selection is kept when switching modes. In listbox mode, arrow keys move focus; Enter
          or Space selects an option. The application updates <code>active</code> to reflect its state.
          In form mode, radio arrow keys select a time and Space toggles a checkbox. Disabled choices
          are skipped. Enable “Click anywhere in the row” to extend the native controls' click targets
          to the row edges.
        </p>
      </QDocsSection>

      <QDocsSection title="Controls in Rows">
        {#snippet sectionDescription()}
          Combine a setting's description with a trailing control. Use <code>preserveTabOrder</code>
          to keep normal Tab navigation and text editing. <code>toggle</code> holds a control
          without shrinking;
          <code>side</code> accommodates content at its natural width.
        {/snippet}

        <div class="list-example controls-example full-width min-width-0">
          <QList bordered preserveTabOrder separator role="group" aria-label="Booking preferences">
            <QItem class="wrap">
              <QItemSection>
                Booking reminder
                {#snippet line1()}Receive a reminder before your booking{/snippet}
              </QItemSection>
              <QItemSection type="toggle">
                <QSwitch bind:value={shouldReceiveReminder} aria-label="Booking reminder" />
              </QItemSection>
            </QItem>
            <QItem class="wrap">
              <QItemSection>Booking details</QItemSection>
              <QItemSection type="side" class="wide-control">
                <QInput
                  class="full-width"
                  bind:value={bookingName}
                  label="Booking name"
                  outlined
                  dense
                  maxlength={40} />
              </QItemSection>
            </QItem>
          </QList>
        </div>
      </QDocsSection>

      <QDocsSection title="Reordering">
        {#snippet sectionDescription()}
          Native <code>draggable</code> enables dragging the whole row and applies its dragged
          appearance. <code>dragHandle</code> marks the grip visually; it does not restrict where a native
          drag starts. The application handles the order. Drag a task before another or use its button
          to move it to first.
        {/snippet}

        <div class="list-example full-width min-width-0">
          <QList
            tag="ol"
            role="list"
            expressive
            segmented
            class="task-list q-ma-none q-pa-none"
            aria-label="Task order">
            {#each tasks as task, index (task)}
              <QItem
                tag="li"
                draggable
                ondragstart={(event) => {
                  draggedTask = task;
                  event.dataTransfer?.setData("text/plain", task);
                }}
                ondragend={() => (draggedTask = undefined)}
                ondragover={(event) => {
                  if (draggedTask) {
                    event.preventDefault();
                  }
                }}
                ondrop={(event) => dropTask(event, task)}>
                <QItemSection type="icon" dragHandle>
                  <QIcon name="drag_indicator" aria-hidden="true" />
                </QItemSection>
                <QItemSection>
                  {task}
                  {#snippet line1()}Position {index + 1}{/snippet}
                </QItemSection>
                <QItemSection type="side">
                  <QIconBtn
                    icon="vertical_align_top"
                    aria-label={"Move " + task + " to first"}
                    onclick={(event) => prioritizeTask(task, event.currentTarget)} />
                </QItemSection>
              </QItem>
            {/each}
          </QList>
          <p class="example-status body-medium q-mt-md q-mb-none" role="status">{taskStatus}</p>
        </div>

        <p class="body-medium">
          The keyboard action keeps focus on the moved button and announces its new position. Custom
          pointer or touch implementations can set <code>dragged</code> directly.
        </p>
      </QDocsSection>

      <QDocsSection title="Images and Supporting Text">
        {#snippet sectionDescription()}
          Keep related rows aligned by using the same section types. <code>thumbnail</code> sizes
          square images; <code>avatar</code> holds an avatar, as in the preview. The content section
          accepts a <code>headline</code> and supporting snippets <code>line1</code> through
          <code>line3</code>. <code>trailingText</code> keeps short metadata separate.
        {/snippet}

        <div class="list-example full-width min-width-0">
          <QList bordered separator expressive={false} role="list" aria-label="Counter guides">
            <QItem role="listitem">
              <QItemSection type="thumbnail">
                <img
                  src={asset("cocktail-close-up.jpg")}
                  alt=""
                  width="56"
                  height="56"
                  loading="lazy" />
              </QItemSection>
              <QItemSection>
                {#snippet headline()}Getting the ice right{/snippet}
                {#snippet line1()}Keep a fresh scoop ready for service.{/snippet}
                {#snippet line2()}A quick guide for the counter{/snippet}
              </QItemSection>
              <QItemSection type="trailingText" class="text-no-wrap">3 min</QItemSection>
            </QItem>
            <QItem role="listitem">
              <QItemSection type="thumbnail">
                <img
                  src={asset("iced-lime-drink.jpg")}
                  alt=""
                  width="56"
                  height="56"
                  loading="lazy" />
              </QItemSection>
              <QItemSection>
                {#snippet headline()}Citrus finishing touches{/snippet}
                {#snippet line1()}Add fresh slices just before serving.{/snippet}
                {#snippet line2()}Simple details for the menu{/snippet}
              </QItemSection>
              <QItemSection type="trailingText" class="text-no-wrap">5 min</QItemSection>
            </QItem>
          </QList>
        </div>

        <p class="body-medium">
          Use <code>icon</code> for a leading symbol and <code>trailingIcon</code> for a trailing
          symbol. <code>video</code> sizes a video preview to 114 × 64 pixels. The sample photos are
          local docs assets; replace their <code>src</code> paths with your own images.
        </p>
      </QDocsSection>

      <QDocsSection title="Links">
        {#snippet sectionDescription()}
          <code>to</code> and <code>href</code> make the whole item a link. Keep the rows consistent
          and put the destination in the label. Route links follow the current route's active state;
          use <code>active</code> to override it.
        {/snippet}

        <nav class="list-example full-width min-width-0" aria-label="Booking and component links">
          <QList bordered separator expressive={false}>
            <QItem href="#booking-selection" active={false}>
              <QItemSection type="icon">
                <QIcon name="event" aria-hidden="true" />
              </QItemSection>
              <QItemSection>
                Choose a booking time
                {#snippet line1()}Jump to the selection example{/snippet}
              </QItemSection>
              <QItemSection type="trailingIcon">
                <QIcon name="arrow_upward" aria-hidden="true" />
              </QItemSection>
            </QItem>
            <QItem to="/components/checkbox">
              <QItemSection type="icon">
                <QIcon name="check_box" aria-hidden="true" />
              </QItemSection>
              <QItemSection>
                Checkbox documentation
                {#snippet line1()}Explore independent choices and mixed states{/snippet}
              </QItemSection>
              <QItemSection type="trailingIcon">
                <QIcon name="arrow_forward" aria-hidden="true" />
              </QItemSection>
            </QItem>
            <QItem to="/components/radio">
              <QItemSection type="icon">
                <QIcon name="radio_button_checked" aria-hidden="true" />
              </QItemSection>
              <QItemSection>
                Radio documentation
                {#snippet line1()}Explore single-choice groups{/snippet}
              </QItemSection>
              <QItemSection type="trailingIcon">
                <QIcon name="arrow_forward" aria-hidden="true" />
              </QItemSection>
            </QItem>
          </QList>
        </nav>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        <p>
          Give interactive lists a clear accessible name. For static content, use list and list-item
          roles or semantic <code>ul</code>/<code>li</code> tags. Hide decorative icons from assistive
          technology, and label every icon-only action.
        </p>
        <p>
          By default, Tab enters and leaves an interactive list; arrow keys move between its
          actions. Selection lists use <code>listbox</code>/<code>option</code> semantics and expose
          <code>active</code> as the selected state. Keep their selection indicators decorative.
        </p>
        <p>
          For form controls, omit <code>selection</code> and enable <code>preserveTabOrder</code>.
          Give checkboxes and radios visible labels, and related radios a shared <code>name</code>.
          Keep inputs as the only keyboard targets; do not also make their rows
          <code>clickable</code>. Provide a keyboard alternative for drag operations, as in the
          reordering example.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }

  .list-usage :global(.q-docs-section__header h5) {
    overflow-wrap: anywhere;
  }

  .list-preview {
    width: min(420px, 100%);
    max-height: 100%;
    border-radius: 16px;
  }

  .list-preview h2 {
    margin-block: 0 12px;
  }

  .list-example {
    max-width: 640px;
  }

  .example-status {
    overflow-wrap: anywhere;
  }

  .list-usage :global(.q-switch) {
    max-width: 100%;
  }

  .selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    max-width: 960px;
  }

  .selection-grid h3 {
    margin-block: 0 12px;
  }

  .controls-example :global(.q-item__section--content) {
    flex: 1 1 200px;
  }

  .controls-example :global(.wide-control) {
    flex: 1 1 240px;
  }

  #booking-selection {
    scroll-margin-block-start: 96px;
  }

  .list-example :global(.task-list) {
    list-style: none;
  }
</style>
