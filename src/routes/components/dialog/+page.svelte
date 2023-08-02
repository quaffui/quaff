<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDialog from "$lib/components/dialog/QDialog.svelte";
  import { QDialogDocs } from "$lib/components/dialog/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import DialogContent from "./DialogContent.svelte";
  import snippets from "./docs.snippets";

  let exampleDialog = false,
    exampleDialogEl: QDialog,
    topDialog = false,
    topDialogEl: QDialog,
    defaultDialog = false,
    defaultDialogEl: QDialog,
    rightDialog = false,
    rightDialogEl: QDialog,
    bottomDialog = false,
    bottomDialogEl: QDialog,
    leftDialog = false,
    leftDialogEl: QDialog,
    modalDialog = false,
    modalDialogEl: QDialog,
    persistentDialog = false,
    persistentDialogEl: QDialog,
    fullscreenDialog = false,
    fullscreenDialogEl: QDialog,
    methodsDialog = false,
    methodsDialogEl: QDialog,
    btnAttrsDialog = false,
    btnAttrsDialogEl;
</script>

<QDocs QComponentDocs={QDialogDocs}>
  <QDialog
    slot="display"
    btnContent="Open cookie settings"
    modal
    persistent
    bind:value={exampleDialog}
    bind:this={exampleDialogEl}
  >
    <DialogContent dialogEl={exampleDialogEl} />
  </QDialog>

  <div slot="usage">
    <QDocsSection {snippets} title="Positions">
      <QDialog bind:this={defaultDialogEl} bind:value={defaultDialog} btnContent="Default">
        <DialogContent dialogEl={defaultDialogEl} />
      </QDialog>
      <QDialog bind:this={topDialogEl} bind:value={topDialog} btnContent="Top" position="top">
        <DialogContent dialogEl={topDialogEl} />
      </QDialog>
      <QDialog
        bind:this={rightDialogEl}
        bind:value={rightDialog}
        btnContent="Right"
        position="right"
      >
        <DialogContent dialogEl={rightDialogEl} />
      </QDialog>
      <QDialog
        bind:this={bottomDialogEl}
        bind:value={bottomDialog}
        btnContent="Bottom"
        position="bottom"
      >
        <DialogContent dialogEl={bottomDialogEl} />
      </QDialog>
      <QDialog bind:this={leftDialogEl} bind:value={leftDialog} btnContent="Left" position="left">
        <DialogContent dialogEl={leftDialogEl} />
      </QDialog>
    </QDocsSection>

    <QDocsSection {snippets} title="Types">
      <QDialog bind:this={modalDialogEl} bind:value={modalDialog} btnContent="Modal" modal>
        <DialogContent dialogEl={modalDialogEl} />
      </QDialog>
      <QDialog
        bind:this={fullscreenDialogEl}
        bind:value={fullscreenDialog}
        btnContent="Fullscreen"
        fullscreen
      >
        <DialogContent dialogEl={fullscreenDialogEl} />
      </QDialog>
      <QDialog
        bind:this={persistentDialogEl}
        bind:value={persistentDialog}
        btnContent="Persistent"
        persistent
        modal
      >
        <DialogContent dialogEl={persistentDialogEl} />
      </QDialog>
    </QDocsSection>

    <QDocsSection {snippets} title="noBtn and programmatic toggle">
      <QDialog bind:this={methodsDialogEl} bind:value={methodsDialog} noBtn persistent>
        <DialogContent dialogEl={methodsDialogEl} />
      </QDialog>
      <QBtn on:activated={methodsDialogEl.show}>Show</QBtn>
      <QBtn on:activated={methodsDialogEl.hide}>Hide</QBtn>
      <QBtn on:activated={methodsDialogEl.toggle}>Toggle</QBtn>
    </QDocsSection>

    <QDocsSection {snippets} title="Custom button attributes">
      <QDialog
        bind:this={btnAttrsDialogEl}
        bind:value={btnAttrsDialog}
        btnContent="Custom button styles"
        btnAttrs={{ icon: "star", rectangle: true, outline: true }}
      >
        <DialogContent dialogEl={btnAttrsDialogEl} />
      </QDialog>
    </QDocsSection>
  </div>
</QDocs>
