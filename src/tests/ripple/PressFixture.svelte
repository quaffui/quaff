<script lang="ts">
  import QBtn from "#components/button/QBtn.svelte";
  import QDialog from "#components/dialog/QDialog.svelte";

  let isDialogOpen = $state(false);
</script>

<div style="padding: 200px 0 0 400px;">
  <QBtn id="press" label="Press" />
  <QBtn id="open" label="Open dialog" onclick={() => (isDialogOpen = true)} />
</div>

<QDialog bind:value={isDialogOpen} modal>
  <button id="dialog-action" type="button">Close</button>
</QDialog>
