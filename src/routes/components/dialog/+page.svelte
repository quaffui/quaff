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
    buttonPropsDialog: Dialog = {
      el: null,
      value: false,
    };
</script>

<QDocs QComponentDocs={QDialogDocs}>
  <QDialog
    slot="display"
    button
    buttonLabel="Open cookie settings"
    modal
    persistent
    bind:value={exampleDialog.value}
    bind:this={exampleDialog.el}
  >
    <DialogContent dialogEl={exampleDialog.el} />
  </QDialog>

  <div slot="usage">
    <QDocsSection {snippets} title="Positions">
      <QDialog
        bind:this={defaultDialog.el}
        bind:value={defaultDialog.value}
        button
        buttonLabel="Default"
      >
        <DialogContent dialogEl={defaultDialog.el} />
      </QDialog>
      <QDialog
        bind:this={topDialog.el}
        bind:value={topDialog.value}
        button
        buttonLabel="Top"
        position="top"
      >
        <DialogContent dialogEl={topDialog.el} />
      </QDialog>
      <QDialog
        bind:this={rightDialog.el}
        bind:value={rightDialog.value}
        button
        buttonLabel="Right"
        position="right"
      >
        <DialogContent dialogEl={rightDialog.el} />
      </QDialog>
      <QDialog
        bind:this={bottomDialog.el}
        bind:value={bottomDialog.value}
        button
        buttonLabel="Bottom"
        position="bottom"
      >
        <DialogContent dialogEl={bottomDialog.el} />
      </QDialog>
      <QDialog
        bind:this={leftDialog.el}
        bind:value={leftDialog.value}
        button
        buttonLabel="Left"
        position="left"
      >
        <DialogContent dialogEl={leftDialog.el} />
      </QDialog>
    </QDocsSection>

    <QDocsSection {snippets} title="Types">
      <QDialog
        bind:this={modalDialog.el}
        bind:value={modalDialog.value}
        button
        buttonLabel="Modal"
        modal
      >
        <DialogContent dialogEl={modalDialog.el} />
      </QDialog>
      <QDialog
        bind:this={fullscreenDialog.el}
        bind:value={fullscreenDialog.value}
        button
        buttonLabel="Fullscreen"
        fullscreen
      >
        <DialogContent dialogEl={fullscreenDialog.el} />
      </QDialog>
      <QDialog
        bind:this={persistentDialog.el}
        bind:value={persistentDialog.value}
        button
        buttonLabel="Persistent"
        persistent
        modal
      >
        <DialogContent dialogEl={persistentDialog.el} />
      </QDialog>
    </QDocsSection>

    <QDocsSection {snippets} title="Programmatic toggle">
      <QDialog bind:this={methodsDialog.el} bind:value={methodsDialog.value} persistent>
        <DialogContent dialogEl={methodsDialog.el} />
      </QDialog>
      <QBtn on:click={() => methodsDialog.el?.show()}>Show</QBtn>
      <QBtn on:click={() => methodsDialog.el?.hide()}>Hide</QBtn>
      <QBtn on:click={() => methodsDialog.el?.toggle()}>Toggle</QBtn>
    </QDocsSection>

    <QDocsSection {snippets} title="Value toggle">
      <QDialog bind:value={methodsDialog.value} persistent>
        <DialogContent dialogEl={methodsDialog.el} />
      </QDialog>
      <QBtn on:click={() => (methodsDialog.value = true)}>Show</QBtn>
      <QBtn on:click={() => (methodsDialog.value = false)}>Hide</QBtn>
      <QBtn on:click={() => (methodsDialog.value = !methodsDialog.value)}>Toggle</QBtn>
    </QDocsSection>

    <QDocsSection {snippets} title="Custom button attributes">
      <QDialog
        bind:this={buttonPropsDialog.el}
        bind:value={buttonPropsDialog.value}
        button
        buttonLabel="Custom button styles"
        buttonProps={{ icon: "star", rectangle: true, outline: true }}
      >
        <DialogContent dialogEl={buttonPropsDialog.el} />
      </QDialog>
    </QDocsSection>
  </div>
</QDocs>
