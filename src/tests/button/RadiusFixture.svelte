<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QBtnGroup from "$components/button-group/QBtnGroup.svelte";
  import QToolbar from "$components/toolbar/QToolbar.svelte";

  const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
  let selected = $state(true);
</script>

<main style="display: grid; justify-items: start; gap: 48px; padding: 48px">
  {#each SIZES as size (size)}
    <QBtn id={size} expressive {size} label="Save changes" noRipple />
  {/each}

  <QIconBtn id="narrow" expressive width="narrow" icon="add" aria-label="Add item" noRipple />
  <QIconBtn id="wide" expressive width="wide" icon="add" aria-label="Add item" noRipple />

  <QBtnGroup expressive spread={false}>
    <QBtn id="grouped" label="First" noRipple />
    <QBtn label="Second" noRipple />
  </QBtnGroup>

  <QBtnGroup expressive connected spread={false}>
    <QBtn id="connected" label="First" noRipple />
    <QBtn label="Second" noRipple />
  </QBtnGroup>

  <QToolbar floating aria-label="Document tools">
    <QIconBtn id="toolbar" expressive selected icon="edit" aria-label="Edit" noRipple />
  </QToolbar>

  <QBtn id="selected" expressive shape="squared" bind:selected label="Save changes" noRipple />

  <div style="width: 180px">
    <QBtn id="wrapped" expressive label="Save the changes to your document" noRipple />
  </div>
</main>
