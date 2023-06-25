<script>
  import QDialog from "../dialog/QDialog.svelte";
  import QTooltip from "../tooltip/QTooltip.svelte";
  import { Prism } from "prismjs";
  import "prism-svelte";

  export let title, snippets;

  let dialog = false;
  let tooltipContent = "Copy";

  async function copySnippet() {
    try {
      if (navigator.clipboard.write) {
        await navigator.clipboard.write(snippets[title].text);
      } else {
        await navigator.clipboard.writeText(snippets[title].text);
      }

      tooltipContent = "Copied!";
      setTimeout(() => {
        tooltipContent = "Copy";
      }, 3000);
    } catch (e) {
      tooltipContent = "Error while copying...";
      setTimeout(() => {
        tooltipContent = "Copy";
      }, 3000);
    }
  }
</script>

<div style="margin-bottom:48px">
  <div class="row q-mb-md">
    <h5>{title}</h5>
    <QDialog
      class="snippet-dialog"
      bind:value={dialog}
      btnAttrs={{ outline: true, icon: "code", class: "circle" }}
      on:btnClick={() => (dialog = true)}
      modal
    >
      <div>
        <QTooltip position="right">
          {tooltipContent}
        </QTooltip>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <pre class="language-svelte" on:click={copySnippet}><code>{@html snippets[title].html}</code
          ></pre>
      </div>
    </QDialog>
  </div>
  <slot />
</div>

<style>
  :global(.snippet-dialog) {
    overflow: visible;
  }
  pre {
    cursor: pointer;
  }
</style>
