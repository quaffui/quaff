<script lang="ts">
  import { resolve } from "$app/paths";
  import { QSnackbarDocs } from "$components/snackbar/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QDocs, QDocsSection } from "$docs";
  import { QBtn, QSnackbar } from "$lib";
  import { pageTitle } from "$helpers/pageTitle";
  import snippets from "./docs.snippets";

  type SnackbarExample = "display" | "basic" | "action" | "dismissible" | "longAction";

  docsCtx.set({ snippets, componentDocs: QSnackbarDocs });

  let displayOpen = $state(false);
  let basicOpen = $state(false);
  let actionOpen = $state(false);
  let dismissibleOpen = $state(false);
  let longActionOpen = $state(false);
  let saveStatus = $state("");
  let deleted = $state(false);
  let activeExample = $state<SnackbarExample>();
  let pendingExample: SnackbarExample | undefined;

  const undoAction = {
    label: "Undo",
    handler: () => (deleted = false),
  };

  const reviewAction = {
    label: "Review changes",
  };

  function setOpenSnackbar(example?: SnackbarExample) {
    displayOpen = example === "display";
    basicOpen = example === "basic";
    actionOpen = example === "action";
    dismissibleOpen = example === "dismissible";
    longActionOpen = example === "longAction";
  }

  function openSnackbar(example: SnackbarExample) {
    activeExample = example;
    setOpenSnackbar(example);
  }

  function showSnackbar(example: SnackbarExample) {
    if (activeExample) {
      pendingExample = example;
      setOpenSnackbar();
      return;
    }

    openSnackbar(example);
  }

  function handleSnackbarHidden() {
    activeExample = undefined;

    if (pendingExample) {
      const next = pendingExample;
      pendingExample = undefined;
      openSnackbar(next);
    }
  }

  function save() {
    saveStatus = "Preferences saved";
    showSnackbar("basic");
  }

  function removeItem() {
    deleted = true;
    showSnackbar("action");
  }
</script>

<svelte:head>
  <title>{pageTitle("QSnackbar")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QBtn label="Show snackbar" onclick={() => showSnackbar("display")} />
    <QSnackbar bind:value={displayOpen} message="Message sent" onHidden={handleSnackbarHidden} />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Snackbar">
        {#snippet sectionDescription()}
          Plain snackbars close automatically after six seconds. On the web, also show the same
          message next to the control that caused it, so users can read it for as long as needed.
        {/snippet}

        <div class="flex items-center q-gap-md">
          <QBtn label="Save preferences" onclick={save} />
          <span aria-live="polite">{saveStatus}</span>
        </div>
        <QSnackbar
          bind:value={basicOpen}
          message="Preferences saved"
          onHidden={handleSnackbarHidden}
        />
      </QDocsSection>

      <QDocsSection title="Snackbar with Action">
        {#snippet sectionDescription()}
          A snackbar can have one text action. It stays visible until the user selects the action or
          closes the snackbar.
        {/snippet}

        <div class="flex items-center q-gap-md">
          <QBtn label="Remove item" onclick={removeItem} />
          <span>{deleted ? "Item removed" : "Item available"}</span>
        </div>
        <QSnackbar
          bind:value={actionOpen}
          message="Item removed"
          action={undoAction}
          onHidden={handleSnackbarHidden}
        />
      </QDocsSection>

      <QDocsSection title="Close Button">
        {#snippet sectionDescription()}
          Set <code>dismissible</code> when users need a close button. Like an action, the close button
          keeps the snackbar visible until the user closes it.
        {/snippet}

        <QBtn label="Show dismissible snackbar" onclick={() => showSnackbar("dismissible")} />
        <QSnackbar
          bind:value={dismissibleOpen}
          message="Your connection is restored"
          dismissible
          onHidden={handleSnackbarHidden}
        />
      </QDocsSection>

      <QDocsSection title="Longer Action">
        {#snippet sectionDescription()}
          Put a long action on a new line so the message still has enough room.
        {/snippet}

        <QBtn label="Show longer action" onclick={() => showSnackbar("longAction")} />
        <QSnackbar
          bind:value={longActionOpen}
          message="Two settings changed. Review them before continuing."
          action={reviewAction}
          actionOnNewLine
          dismissible
          onHidden={handleSnackbarHidden}
        />
      </QDocsSection>

      <QDocsSection title="Placement" noCode>
        {#snippet sectionDescription()}
          Snackbars appear at the bottom of the screen. Use <code>offset</code> to keep them above bottom
          navigation, floating buttons, or other important controls. Show only one snackbar at a time.
        {/snippet}
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          Snackbar messages use a polite live region and never move focus automatically. Snackbars
          with an action do not close automatically. Use Tab to reach their controls and press
          Escape while focused to close.
        {/snippet}
      </QDocsSection>

      <QDocsSection title="Component or Notify" noCode>
        {#snippet sectionDescription()}
          Use QSnackbar when one component controls when it is shown. For app-wide notifications
          that should appear one after another, use the
          <a href={resolve("/utils/notify", {})}>Notify API</a>.
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
