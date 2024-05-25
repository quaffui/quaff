<script lang="ts">
  import { QCard, QCardSection, QToggle, QCheckbox, QCardActions, QBtn, QDialog } from "$lib";

  let exampleToggles = $state([true, true, true]);
  let exampleCheckbox = $state(false);

  let { dialogEl }: { dialogEl: QDialog | null } = $props();
</script>

<QCard title="Cookie settings" flat>
  <QCardSection>
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each exampleToggles as _, index}
      <div class="flex justify-between q-my-sm">
        {#if index === 0}
          <h6 class="small">Cookies {index + 1} (always active)</h6>
          <QToggle bind:value={exampleToggles[index]} disable />
        {:else}
          <h6 class="small">Cookies {index + 1}</h6>
          <QToggle bind:value={exampleToggles[index]} />
        {/if}
      </div>
    {/each}
  </QCardSection>
  <QCardSection>
    <div class="flex items-center" style="white-space: pre">
      I've read the <span class="text-primary" style="cursor: pointer"> terms and conditions </span>
      <QCheckbox class="q-ml-sm" bind:value={exampleCheckbox} />
    </div>
  </QCardSection>
  <QCardActions align="right">
    <QBtn onclick={() => dialogEl?.hide()}>Cancel</QBtn>
    <QBtn onclick={() => dialogEl?.hide()} disabled={!exampleCheckbox}>Save</QBtn>
  </QCardActions>
</QCard>
