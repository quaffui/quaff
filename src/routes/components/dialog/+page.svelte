<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QCard from "$lib/components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
  import QCheckbox from "$lib/components/checkbox/QCheckbox.svelte";
  import QDialog from "$lib/components/dialog/QDialog.svelte";
  import { QDialogDocs } from "$lib/components/dialog/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import QToggle from "$lib/components/toggle/QToggle.svelte";
  import DialogContent from "./DialogContent.svelte";
  import snippets from "./docs.snippets";

  interface Dialog {
    el: QDialog | null;
    value: boolean;
  }

  let exampleDialog: Dialog = {
    el: null,
    value: false,
  };
  let topDialog: Dialog = {
    el: null,
    value: false,
  };
  let defaultDialog: Dialog = {
    el: null,
    value: false,
  };
  let rightDialog: Dialog = {
    el: null,
    value: false,
  };
  let bottomDialog: Dialog = {
    el: null,
    value: false,
  };
  let leftDialog: Dialog = {
    el: null,
    value: false,
  };
  let modalDialog: Dialog = {
    el: null,
    value: false,
  };
  let persistentDialog: Dialog = {
    el: null,
    value: false,
  };
  let fullscreenDialog: Dialog = {
    el: null,
    value: false,
  };
  let methodsDialog: Dialog = {
    el: null,
    value: false,
  };
</script>

<QDocs QComponentDocs={QDialogDocs}>
  <QDialog
    slot="display"
    btnContent="Open cookie settings"
    modal
    persistent
    bind:value={exampleDialog.value}
    bind:this={exampleDialog.el}
  >
    <DialogContent dialogEl={exampleDialog.el} />
  </QDialog>

  <div slot="usage">
    <QDocsSection {snippets} title="Positions">
      <QDialog bind:this={defaultDialog.el} bind:value={defaultDialog.value} btnContent="Default">
        <DialogContent dialogEl={defaultDialog.el} />
      </QDialog>
      <QDialog
        bind:this={topDialog.el}
        bind:value={topDialog.value}
        btnContent="Top"
        position="top"
      >
        <DialogContent dialogEl={topDialog.el} />
      </QDialog>
      <QDialog
        bind:this={rightDialog.el}
        bind:value={rightDialog.value}
        btnContent="Right"
        position="right"
      >
        <DialogContent dialogEl={rightDialog.el} />
      </QDialog>
      <QDialog
        bind:this={bottomDialog.el}
        bind:value={bottomDialog.value}
        btnContent="Bottom"
        position="bottom"
      >
        <DialogContent dialogEl={bottomDialog.el} />
      </QDialog>
      <QDialog
        bind:this={leftDialog.el}
        bind:value={leftDialog.value}
        btnContent="Left"
        position="left"
      >
        <DialogContent dialogEl={leftDialog.el} />
      </QDialog>
    </QDocsSection>

    <QDocsSection {snippets} title="Types">
      <QDialog bind:this={modalDialog.el} bind:value={modalDialog.value} btnContent="Modal" modal>
        <DialogContent dialogEl={modalDialog.el} />
      </QDialog>
      <QDialog
        bind:this={fullscreenDialog.el}
        bind:value={fullscreenDialog.value}
        btnContent="Fullscreen"
        fullscreen
      >
        <DialogContent dialogEl={fullscreenDialog.el} />
      </QDialog>
      <QDialog
        bind:this={persistentDialog.el}
        bind:value={persistentDialog.value}
        btnContent="Persistent"
        persistent
        modal
      >
        <DialogContent dialogEl={persistentDialog.el} />
      </QDialog>
    </QDocsSection>

    <QDocsSection {snippets} title="Methods and noBtn">
      <QDialog bind:this={methodsDialog.el} bind:value={methodsDialog.value} noBtn persistent>
        <DialogContent dialogEl={methodsDialog.el} />
      </QDialog>
      <QBtn on:click={() => methodsDialog.el?.show()}>Show</QBtn>
      <QBtn on:click={() => methodsDialog.el?.hide()}>Hide</QBtn>
      <QBtn on:click={() => methodsDialog.el?.toggle()}>Toggle</QBtn>
    </QDocsSection>
  </div>
</QDocs>
