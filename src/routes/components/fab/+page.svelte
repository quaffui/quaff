<script lang="ts">
  import { QExtendedFabDocs, QFabDocs, QFabMenuDocs } from "$components/fab/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QBtn,
    QDialog,
    QExtendedFab,
    QFab,
    QFabMenu,
    QIcon,
    QInput,
    QItem,
    QItemSection,
    QList,
    QSwitch,
  } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QFabDocs, QExtendedFabDocs, QFabMenuDocs] });

  const sizes = ["sm", "md", "lg"] as const;
  const BASELINE_HEIGHTS = { sm: 40, md: 56, lg: 96 };
  const EXPRESSIVE_HEIGHTS = { sm: 56, md: 80, lg: 96 };
  const colors = [
    "primary-container",
    "secondary-container",
    "tertiary-container",
    "primary",
    "secondary",
    "tertiary",
    "surface",
  ] as const;
  const menuActions = [
    { label: "Document", icon: "description" },
    { label: "Folder", icon: "create_new_folder" },
    { label: "Drawing", icon: "draw" },
  ] as const;

  let isCollapsed = $state(false);
  const notes = [
    {
      title: "A weekend by the river",
      detail: "A picnic, a good book, nowhere to rush.",
      icon: "water",
      color: "primary",
    },
    {
      title: "The little things",
      detail: "Fresh coffee. Open windows. A new playlist.",
      icon: "local_cafe",
      color: "tertiary",
    },
    {
      title: "Something to make",
      detail: "A postcard for someone far away.",
      icon: "palette",
      color: "secondary",
    },
    {
      title: "Sunday, slowly",
      detail: "Pick up flowers on the way home.",
      icon: "local_florist",
      color: "tertiary",
    },
  ] as const;
  let isComposerOpen = $state(false);
  let noteTitle = $state("");
  let savedNote = $state("");
  let createdItem = $state<(typeof menuActions)[number]>();
  let fabStatus = $state("Choose a size");
  let colorStatus = $state("Choose a color example");
  let extendedStatus = $state("Ready to compose");

  function composeNote() {
    noteTitle = "";
    isComposerOpen = true;
  }

  function saveNote(event: SubmitEvent) {
    event.preventDefault();
    const title = noteTitle.trim();

    if (!title) {
      return;
    }

    savedNote = title;
    isComposerOpen = false;
  }
</script>

<svelte:head>
  <title>{pageTitle("Floating action buttons")}</title>
</svelte:head>

<QDocs
  docName="Floating action buttons"
  docDescription="Present a primary action with a FAB, add a label with an extended FAB, or offer related actions in a FAB menu."
>
  {#snippet display()}
    <div class="fab-placement fab-notebook">
      <div class="fab-demo-heading">
        <QIcon name="auto_stories" aria-hidden="true" />
        <strong>Little notes</strong>
        <span>Just for you</span>
      </div>
      <div class="fab-note-preview">
        <QIcon name="wb_sunny" size="32px" aria-hidden="true" />
        <h5>Make room for a slow weekend</h5>
        <p>{savedNote ? "Saved to your notebook." : "Small plans, good days."}</p>
      </div>
      <QFab
        expressive
        icon="edit"
        color="tertiary"
        aria-label="Write a note"
        class="fab-placement-action"
        onclick={composeNote}
      />
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Baseline and Expressive FABs">
      {#snippet sectionDescription()}
        <p>
          Give <code>QFab</code> an <code>icon</code> and an action-oriented
          <code>aria-label</code>. The label also appears as a tooltip on hover and focus.
          <code>expressive</code> inherits the global Quaff setting unless specified.
        </p>
        <p>
          Baseline sizes are 40, 56, and 96px; expressive sizes are 56, 80, and 96px. Both modes
          default to 56px. The 80px expressive FAB suits most layouts; the 40px baseline size
          remains available for compatibility.
        </p>
      {/snippet}

      {#each [false, true] as expressive (expressive)}
        <h6 class="q-my-md">{expressive ? "Expressive" : "Baseline"}</h6>
        <div class="fab-examples">
          {#each sizes as size (size)}
            <div class="fab-example">
              <QFab
                {expressive}
                {size}
                icon="edit"
                aria-label="Compose"
                onclick={() => (fabStatus = `Draft created with ${size} FAB`)}
              />
              <span>{size} · {(expressive ? EXPRESSIVE_HEIGHTS : BASELINE_HEIGHTS)[size]}px</span>
            </div>
          {/each}
        </div>
      {/each}
      <p class="q-mt-xl" aria-live="polite">{fabStatus}</p>
    </QDocsSection>

    <QDocsSection title="Colors">
      {#snippet sectionDescription()}
        Container colors work in both modes; <code>primary-container</code> is the default.
        Expressive adds the <code>primary</code>, <code>secondary</code>, and
        <code>tertiary</code> tone colors. <code>surface</code> is a legacy baseline style.
      {/snippet}

      <div class="fab-examples">
        {#each colors as color (color)}
          <div class="fab-example">
            <QFab
              expressive={color !== "surface"}
              {color}
              icon="add"
              aria-label="Create"
              onclick={() => (colorStatus = `Created with ${color} FAB`)}
            />
            <code>{color}</code>
          </div>
        {/each}
      </div>
      <p class="q-mt-xl" aria-live="polite">{colorStatus}</p>
    </QDocsSection>

    <QDocsSection title="Extended FAB">
      {#snippet sectionDescription()}
        <p>
          <code>QExtendedFab</code> requires a short <code>label</code>; its <code>icon</code> is optional.
          Baseline extended FABs have a minimum height of 56px. Expressive minimums are 56, 80, and 96px.
          The label determines their width, and larger text can increase their height.
        </p>
        <p>
          Set <code>collapsed</code> to show only the icon while keeping the accessible name. Without
          an icon, the label stays visible. Your application controls when to collapse, such as in response
          to scrolling or limited space.
        </p>
      {/snippet}

      <QSwitch bind:value={isCollapsed} label="Collapse to icon" class="q-mb-lg" />
      <h6 class="q-my-md">Expressive</h6>
      <div class="fab-examples">
        {#each sizes as size (size)}
          <div class="fab-example">
            <QExtendedFab
              expressive
              {size}
              icon="edit"
              label="Compose"
              collapsed={isCollapsed}
              onclick={() => (extendedStatus = `Draft created with ${size} extended FAB`)}
            />
            <span>{size} · {EXPRESSIVE_HEIGHTS[size]}px</span>
          </div>
        {/each}
      </div>
      <h6 class="q-my-md">Baseline</h6>
      <div class="fab-examples">
        <QExtendedFab
          expressive={false}
          icon="edit"
          label="Compose"
          collapsed={isCollapsed}
          onclick={() => (extendedStatus = "New draft created")}
        />
        <QExtendedFab
          expressive={false}
          label="Create account"
          collapsed={isCollapsed}
          onclick={() => (extendedStatus = "Account created")}
        />
      </div>
      <p class="q-mt-xl" aria-live="polite">{extendedStatus}</p>
    </QDocsSection>

    <QDocsSection title="FAB Menu">
      {#snippet sectionDescription()}
        <p>
          Use <code>QFabMenu</code> for two to six related actions. Supply a contextual
          <code>menuLabel</code> and labeled menu items. Bind <code>expanded</code> to observe or control
          the open state. This example uses an expressive FAB. Material 3 specifies a baseline menu popup
          on the web.
        </p>
        <p>
          Opening focuses the first item. Arrow keys navigate; Space or Enter activates an action.
          Escape or an outside click dismisses the menu, and choosing an action closes it.
        </p>
      {/snippet}

      <div class="fab-placement fab-workspace">
        <div class="fab-demo-heading">
          <QIcon name="folder_open" aria-hidden="true" />
          <strong>Weekend workspace</strong>
          <span>Your next idea</span>
        </div>
        <div class="fab-file-grid">
          <div class="fab-file">
            <span class="fab-file-icon"><QIcon name="description" aria-hidden="true" /></span>
            <strong>A little escape</strong>
            <span>Trip notes · Today</span>
          </div>
          <div class="fab-file">
            <span class="fab-file-icon fab-file-icon--drawing"
              ><QIcon name="draw" aria-hidden="true" /></span
            >
            <strong>By the water</strong>
            <span>Sketch · Yesterday</span>
          </div>
          {#if createdItem}
            <div class="fab-file">
              <span class="fab-file-icon"><QIcon name={createdItem.icon} aria-hidden="true" /></span
              >
              <strong>Untitled {createdItem.label.toLowerCase()}</strong>
              <span>Just created</span>
            </div>
          {/if}
        </div>
        <QFabMenu expressive icon="add" menuLabel="Create content" class="fab-placement-action">
          <QList role="presentation">
            {#each menuActions as action (action.label)}
              <QItem clickable role="menuitem" onclick={() => (createdItem = action)}>
                <QItemSection type="icon"
                  ><QIcon name={action.icon} aria-hidden="true" /></QItemSection
                >
                <QItemSection>{action.label}</QItemSection>
              </QItem>
            {/each}
          </QList>
        </QFabMenu>
      </div>
      <p class="q-mt-md" aria-live="polite">
        {createdItem ? `${createdItem.label} created` : "Open the FAB menu to create something."}
      </p>
    </QDocsSection>

    <QDocsSection title="Stationary Placement">
      {#snippet sectionDescription()}
        Keep the primary FAB in place while content scrolls. This notebook places it 16px from the
        bottom and trailing edges. Scroll the notes, then use the FAB to write your own.
      {/snippet}

      <div class="fab-placement">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable region needs keyboard access.) -->
        <div class="fab-scroll" role="region" aria-label="Scrollable notebook" tabindex="0">
          <div class="fab-demo-heading">
            <QIcon name="auto_stories" aria-hidden="true" />
            <strong>Little notes</strong>
            <span>Keep a good thought</span>
          </div>
          <ul class="fab-note-list">
            {#if savedNote}
              <li>
                <span class="fab-file-icon"><QIcon name="edit_note" aria-hidden="true" /></span>
                <div>
                  <strong>{savedNote}</strong>
                  <p>Saved just now</p>
                </div>
              </li>
            {/if}
            {#each notes as note (note.title)}
              <li>
                <span
                  class="fab-file-icon"
                  style="background: var(--{note.color}-container); color: var(--on-{note.color}-container);"
                  ><QIcon name={note.icon} aria-hidden="true" /></span
                >
                <div>
                  <strong>{note.title}</strong>
                  <p>{note.detail}</p>
                </div>
              </li>
            {/each}
          </ul>
        </div>
        <QFab
          expressive
          icon="edit"
          aria-label="Write a note in the notebook"
          class="fab-placement-action"
          onclick={composeNote}
        />
      </div>
      <p class="q-mt-md" aria-live="polite">
        {savedNote ? `Saved “${savedNote}”` : "A little space for your ideas."}
      </p>

      <QDialog bind:value={isComposerOpen} modal aria-labelledby="fab-note-heading">
        <form class="fab-note-form" onsubmit={saveNote}>
          <h5 id="fab-note-heading">A new little note</h5>
          <QInput
            label="What would you like to remember?"
            bind:value={noteTitle}
            maxlength={60}
            required
          />
          <div class="fab-form-actions">
            <QBtn
              type="button"
              variant="flat"
              label="Cancel"
              onclick={() => (isComposerOpen = false)}
            />
            <QBtn type="submit" variant="filled" label="Save note" disabled={!noteTitle.trim()} />
          </div>
        </form>
      </QDialog>
    </QDocsSection>

    <QDocsSection title="Accessibility" noCode>
      {#snippet sectionDescription()}
        <p>
          Hide unavailable actions instead of disabling a FAB. Use a clear icon and an accessible
          name describing the action. Tab focuses the button; Space or Enter activates it. Keep
          nearby controls and their focus indicators visible when positioning a FAB.
        </p>
        <p>
          See the Material 3 specifications for
          <a
            class="q-docs-link"
            href="https://m3.material.io/components/floating-action-button/specs">FABs</a
          >,
          <a class="q-docs-link" href="https://m3.material.io/components/extended-fab/specs"
            >extended FABs</a
          >, and
          <a class="q-docs-link" href="https://m3.material.io/components/fab-menu/specs"
            >FAB menus</a
          >, plus the
          <a
            class="q-docs-link"
            href="https://m3.material.io/components/floating-action-button/accessibility"
            >accessibility guidance</a
          >.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .fab-examples {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 24px;
  }

  .fab-example {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .fab-placement {
    position: relative;
    height: 320px;
    overflow: hidden;
    border: 1px solid var(--outline-variant);
    border-radius: 24px;
    background: var(--surface-container-low);
    color: var(--on-surface);
  }

  .fab-scroll {
    height: 100%;
    overflow: auto;
    padding: 20px 20px 96px;
  }

  .fab-scroll:focus-visible {
    outline: 3px solid var(--secondary);
    outline-offset: -3px;
  }

  .fab-placement :global(.fab-placement-action) {
    position: absolute;
    inset-block-end: 16px;
    inset-inline-end: 16px;
  }

  .fab-notebook {
    width: 100%;
    max-width: 25rem;
    padding: 20px;
  }

  .fab-demo-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }

  .fab-demo-heading > span {
    margin-inline-start: auto;
    color: var(--on-surface-variant);
    font-size: 0.75rem;
  }

  .fab-note-preview {
    padding: 20px;
    border-radius: 8px 24px 24px 24px;
    background: var(--primary-container);
    color: var(--on-primary-container);
    overflow-wrap: anywhere;
  }

  .fab-note-preview h5 {
    margin-block: 12px 8px;
  }

  .fab-note-preview p,
  .fab-note-list p {
    margin: 0;
  }

  .fab-workspace {
    height: auto;
    min-height: 320px;
    padding: 20px 20px 96px;
  }

  .fab-file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 144px), 1fr));
    gap: 16px;
  }

  .fab-file {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    background: var(--surface-container-highest);
  }

  .fab-file > span:last-child,
  .fab-note-list p {
    color: var(--on-surface-variant);
    font-size: 0.875rem;
  }

  .fab-file-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: var(--primary-container);
    color: var(--on-primary-container);
  }

  .fab-file-icon--drawing {
    background: var(--tertiary-container);
    color: var(--on-tertiary-container);
  }

  .fab-note-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .fab-note-list li {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-block: 16px;
    border-bottom: 1px solid var(--outline-variant);
    border-radius: 0;
    overflow-wrap: anywhere;
  }

  .fab-note-form {
    display: grid;
    gap: 24px;
    width: 416px;
    max-width: 100%;
  }

  .fab-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
