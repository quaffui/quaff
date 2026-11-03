<script module lang="ts">
  import Notify from "#classes/Notify.js";

  export function showNotification(message = "Saved") {
    return Notify.create({
      message,
      timeout: 0,
      actions: [
        {
          label: "Undo",
          handler() {
            const output = document.querySelector("#actions")!;
            output.textContent = String(Number(output.textContent) + 1);
          },
        },
      ],
      onHidden() {
        const output = document.querySelector("#hidden")!;
        output.textContent = String(Number(output.textContent) + 1);
      },
    });
  }

  export function openDialog(id: string) {
    document.querySelector<HTMLDialogElement>(`#${id}`)!.showModal();
  }

  export function closeDialog(id: string) {
    document.querySelector<HTMLDialogElement>(`#${id}`)!.close();
  }

  export function removeDialog(id: string) {
    const dialog = document.querySelector<HTMLDialogElement>(`#${id}`)!;
    dialog.close();
    dialog.remove();
  }

  export function clearNotifications() {
    Notify.clear();
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import QDialog from "#components/dialog/QDialog.svelte";
  import QSnackbar from "#components/snackbar/QSnackbar.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  let isQuaffOpen = $state(false);
  let isQuaffMounted = $state(true);

  if (params.has("notify-on-render")) {
    showNotification("Hydrated notification");
  }
</script>

<button id="outside">Outside</button>
<button id="open-quaff" onclick={() => (isQuaffOpen = true)}>Open Quaff dialog</button>
<output id="actions">0</output>
<output id="hidden">0</output>
<dialog id="early" aria-label="Earlier in DOM">
  <input id="early-input" aria-label="Early field" />
  <dialog id="nested" aria-label="Nested dialog">
    <input id="nested-input" aria-label="Nested field" />
  </dialog>
</dialog>
<dialog id="late" aria-label="Later in DOM">
  <input id="late-input" aria-label="Late field" />
</dialog>
{#if isQuaffMounted}
  <QDialog id="quaff-dialog" bind:value={isQuaffOpen} modal aria-label="Quaff dialog">
    <input id="quaff-input" aria-label="Quaff field" />
    <button id="remove-quaff" onclick={() => (isQuaffMounted = false)}>Unmount dialog</button>
    {#if params.has("tall")}
      <div style="height: 2000px;">Scrollable dialog content</div>
    {/if}
  </QDialog>
{/if}

{#if params.has("standalone")}
  <QSnackbar value message="Standalone notification" timeout={0} />
{/if}
