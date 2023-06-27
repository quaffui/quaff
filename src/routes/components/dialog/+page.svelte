<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QCard from "$lib/components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
  import QCheckbox from "$lib/components/checkbox/QCheckbox.svelte";
  import QDialog from "$lib/components/dialog/QDialog.svelte";
  import { QDialogDocs } from "$lib/components/dialog/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QToggle from "$lib/components/toggle/QToggle.svelte";

  let exampleDialog = false;
  let exampleToggles = [true, true, true];
  let exampleCheckbox = false;
</script>

<QDocs QComponentDocs={QDialogDocs}>
  <QDialog
    slot="display"
    btnContent="Open cookie settings"
    modal
    persistent
    bind:value={exampleDialog}
    on:btnClick={() => (exampleDialog = !exampleDialog)}
  >
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
          I've read the <span class="primary-text" style="cursor: pointer">
            terms and conditions
          </span>
          <QCheckbox class="q-ml-sm" bind:value={exampleCheckbox} />
        </div>
      </QCardSection>
      <QCardActions align="right">
        <QBtn on:click={() => (exampleDialog = !exampleDialog)} disable={!exampleCheckbox}>
          Save
        </QBtn>
      </QCardActions>
    </QCard>
  </QDialog>
</QDocs>
