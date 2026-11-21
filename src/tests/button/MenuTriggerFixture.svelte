<script lang="ts">
  import { untrack } from "svelte";
  import QBtnGroup from "#components/button-group/QBtnGroup.svelte";
  import QBtn from "#components/button/QBtn.svelte";
  import QMenu from "#components/menu/QMenu.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const label = params.has("narrow") ? "More actions" : "More document actions";
  const spacing = params.get("spacing") ?? undefined;
  const expressive = !params.has("standard");
  const useSnippetLabel = params.has("snippet");
  const groupIcon = params.has("group-icon") ? "dark_mode" : undefined;
  let open = $state(false);
  let showLabel = $state(false);
</script>

<main style="display: grid; justify-items: start; gap: 16px; padding: 48px">
  <QBtn
    id="icon-trigger"
    flat
    {expressive}
    icon="dark_mode"
    aria-label="Dark mode"
    class={spacing}
    onclick={() => (open = !open)}
  >
    {#if showLabel}Appearance{/if}
    <QMenu bind:value={open}>Menu content</QMenu>
  </QBtn>
  <button type="button" onclick={() => (showLabel = !showLabel)}>Toggle label</button>

  <div style:width={params.has("narrow") ? "130px" : "180px"}>
    <QBtn id="labeled-button" flat {expressive} icon="dark_mode" {label} class={spacing} />
    <QBtn id="label-and-menu" flat {expressive} icon="dark_mode" {label} class={spacing}>
      <QMenu>Menu content</QMenu>
    </QBtn>
    <QBtn id="text-and-menu" flat {expressive} icon="dark_mode" class={spacing}>
      {label}<QMenu>Menu content</QMenu>
    </QBtn>
  </div>

  <div style:width={groupIcon ? "226px" : "170px"}>
    <QBtnGroup expressive spread>
      <QBtn id="save" label="Save" />
      <QBtn id="more-actions" icon={groupIcon} label={useSnippetLabel ? undefined : "More actions"}>
        {#if useSnippetLabel}More actions{/if}
        <QMenu>Menu content</QMenu>
      </QBtn>
    </QBtnGroup>
  </div>
</main>
