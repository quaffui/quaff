<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDialog from "$lib/components/dialog/QDialog.svelte";
  import { QDialogDocs } from "$lib/components/dialog/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import DialogContent from "./DialogContent.svelte";
  import snippets from "./docs.snippets";

  interface Dialog {
    el: ReturnType<typeof QDialog> | null;
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
    };
</script>

<QDocs componentDocs={QDialogDocs}>
  {#snippet display()}
    <QBtn onclick={exampleDialog.el?.show}>Open cookie settings</QBtn>

    <QDialog modal persistent bind:value={exampleDialog.value} bind:this={exampleDialog.el}>
      <DialogContent dialogEl={exampleDialog.el} />
    </QDialog>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Positions">
        <QBtn onclick={defaultDialog.el?.show}>Default</QBtn>
        <QDialog bind:this={defaultDialog.el} bind:value={defaultDialog.value}>
          <DialogContent dialogEl={defaultDialog.el} />
        </QDialog>

        <QBtn onclick={topDialog.el?.show}>Top</QBtn>
        <QDialog bind:this={topDialog.el} bind:value={topDialog.value} position="top">
          <DialogContent dialogEl={topDialog.el} />
        </QDialog>

        <QBtn onclick={rightDialog.el?.show}>Right</QBtn>
        <QDialog bind:this={rightDialog.el} bind:value={rightDialog.value} position="right">
          <DialogContent dialogEl={rightDialog.el} />
        </QDialog>

        <QBtn onclick={bottomDialog.el?.show}>Bottom</QBtn>
        <QDialog bind:this={bottomDialog.el} bind:value={bottomDialog.value} position="bottom">
          <DialogContent dialogEl={bottomDialog.el} />
        </QDialog>

        <QBtn onclick={leftDialog.el?.show}>Left</QBtn>
        <QDialog bind:this={leftDialog.el} bind:value={leftDialog.value} position="left">
          <DialogContent dialogEl={leftDialog.el} />
        </QDialog>
      </QDocsSection>

      <QDocsSection {snippets} title="Types">
        <QBtn onclick={modalDialog.el?.show}>Modal</QBtn>
        <QDialog bind:this={modalDialog.el} bind:value={modalDialog.value} modal>
          <DialogContent dialogEl={modalDialog.el} />
        </QDialog>

        <QBtn onclick={fullscreenDialog.el?.show}>Fullscreen</QBtn>
        <QDialog bind:this={fullscreenDialog.el} bind:value={fullscreenDialog.value} fullscreen>
          <DialogContent dialogEl={fullscreenDialog.el} />
        </QDialog>

        <QBtn onclick={persistentDialog.el?.show}>Persistent</QBtn>
        <QDialog
          bind:this={persistentDialog.el}
          bind:value={persistentDialog.value}
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
        <QBtn onclick={methodsDialog.el?.show}>Show</QBtn>
        <QBtn onclick={methodsDialog.el?.hide}>Hide</QBtn>
        <QBtn onclick={methodsDialog.el?.toggle}>Toggle</QBtn>
      </QDocsSection>

      <QDocsSection {snippets} title="Value toggle">
        <QDialog bind:value={methodsDialog.value} persistent>
          <DialogContent dialogEl={methodsDialog.el} />
        </QDialog>
        <QBtn onclick={() => (methodsDialog.value = true)}>Show</QBtn>
        <QBtn onclick={() => (methodsDialog.value = false)}>Hide</QBtn>
        <QBtn onclick={() => (methodsDialog.value = !methodsDialog.value)}>Toggle</QBtn>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
