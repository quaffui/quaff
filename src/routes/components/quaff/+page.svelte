<script lang="ts">
  import QCard from "$lib/components/card/QCard.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
</script>

<div class="grid" style="min-height: 400px; margin: 1rem">
  <QCard class="s6 flex center-align primary-container">
    <h1 class="large" slot="title">The $Quaff object</h1>
  </QCard>
  <QCard class="s6 q-mt-none secondary-container flex center-align">
    <QCardSection class="flex center-align">
      <h3>This object allows you to read and manipulate global data, such as dark mode.</h3>
    </QCardSection>
  </QCard>
</div>
