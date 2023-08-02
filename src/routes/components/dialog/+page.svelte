<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDialog from "$lib/components/dialog/QDialog.svelte";
  import { QDialogDocs } from "$lib/components/dialog/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import DialogContent from "./DialogContent.svelte";
  import snippets from "./docs.snippets";

  interface Dialog {
    el: QDialog | null;
    value: boolean;
  }

  let exampleDialog: Dialog = {
      el: null,
      value: false,
    },
    topDialog: Dialog = {
      el: null,
      value: false,
    },
    defaultDialog: Dialog = {
      el: null,
      value: false,
    },
    rightDialog: Dialog = {
      el: null,
      value: false,
    },
    bottomDialog: Dialog = {
      el: null,
      value: false,
    },
    leftDialog: Dialog = {
      el: null,
      value: false,
    },
    modalDialog: Dialog = {
      el: null,
      value: false,
    },
    persistentDialog: Dialog = {
      el: null,
      value: false,
    },
    fullscreenDialog: Dialog = {
      el: null,
      value: false,
    },
    methodsDialog: Dialog = {
      el: null,
      value: false,
    },
    btnAttrsDialog: Dialog = {
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

    <QDocsSection {snippets} title="noBtn and programmatic toggle">
      <QDialog bind:this={methodsDialog.el} bind:value={methodsDialog.value} noBtn persistent>
        <DialogContent dialogEl={methodsDialog.el} />
      </QDialog>
      <QBtn on:activated={methodsDialog.el?.show}>Show</QBtn>
      <QBtn on:activated={methodsDialog.el?.hide}>Hide</QBtn>
      <QBtn on:activated={methodsDialog.el?.toggle}>Toggle</QBtn>
    </QDocsSection>

    <QDocsSection {snippets} title="Custom button attributes">
      <QDialog
        bind:this={btnAttrsDialog.el}
        bind:value={btnAttrsDialog.value}
        btnContent="Custom button styles"
        btnAttrs={{ icon: "star", rectangle: true, outline: true }}
      >
        <DialogContent dialogEl={btnAttrsDialog.el} />
      </QDialog>
    </QDocsSection>
  </div>
</QDocs>
