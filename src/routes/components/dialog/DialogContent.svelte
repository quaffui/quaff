<script lang="ts">
  import { QCard, QCardSection, QToggle, QCheckbox, QCardActions, QBtn, QDialog } from "$lib";

  let exampleToggles = [true, true, true];
  let exampleCheckbox = false;

  export let dialogEl: QDialog | null;
</script>

<QCard title="Cookie settings" flat>
  <QCardSection>
    {#each exampleToggles as toggle, index}
      <div class="flex between-align q-my-sm">
        {#if index === 0}
          <h6 class="small">Cookies {index + 1} (always active)</h6>
          <QToggle bind:value={toggle} disable />
        {:else}
          <h6 class="small">Cookies {index + 1}</h6>
          <QToggle bind:value={toggle} />
        {/if}
      </div>
    {/each}
  </QCardSection>
  <QCardSection>
    <div class="flex middle-align" style="white-space: pre">
      I've read the <span class="primary-text" style="cursor: pointer"> terms and conditions </span>
      <QCheckbox class="q-ml-sm" bind:value={exampleCheckbox} />
    </div>
  </QCardSection>
  <QCardActions align="right">
    <QBtn on:click={() => dialogEl?.hide()}>Cancel</QBtn>
    <QBtn on:click={() => dialogEl?.hide()} disable={!exampleCheckbox}>Save</QBtn>
  </QCardActions>
</QCard>
