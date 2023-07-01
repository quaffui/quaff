<script>
  import QDialog from "../dialog/QDialog.svelte";
  import QTooltip from "../tooltip/QTooltip.svelte";
  import { Prism } from "prismjs";
  import "prism-svelte";
  import QBtn from "../button/QBtn.svelte";

  export let title, snippets;

  let dialog = false;
  let tooltipContent = "Copy";

  async function copySnippet() {
    try {
      if (navigator.clipboard.write) {
        let blob = new Blob([snippets[title].text], { type: "text/plain" });
        let item = new ClipboardItem({ "text/plain": blob });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(snippets[title].text);
      }

      tooltipContent = "Copied!";
      setTimeout(() => {
        tooltipContent = "Copy";
      }, 3000);
    } catch (e) {
      console.log({ e });
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
        <div class="flex between-align middle-align">
          <h4>{title}</h4>
          <QBtn size="sm" icon="content_copy" outline on:click={copySnippet}>{tooltipContent}</QBtn>
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <pre class="language-svelte"><code
            >{@html snippets[title]?.html || "/* No snippet found */"}</code
          ></pre>
      </div>
    </QDialog>
  </div>
  <slot />
</div>

<style>
  pre {
    max-height: 400px;
  }
</style>
