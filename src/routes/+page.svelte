<script lang="ts">
  import QCard from "$components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
  import QLinearProgress from "$lib/components/progress/QLinearProgress.svelte";
  import QCheckbox from "$lib/components/checkbox/QCheckbox.svelte";
  import QRadio from "$lib/components/radio/QRadio.svelte";

  let option = 'option2';
</script>

<div style="max-width: 30em; margin: auto">
  <QCard bordered title="Hello world">
    <QCardSection>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Accusantium aliquid temporibus
      repellat voluptate perspiciatis, consectetur obcaecati minus deserunt facere, dignissimos in
      provident, saepe voluptas suscipit incidunt libero soluta sapiente deleniti.
    </QCardSection>
    <QCardActions align="between">
      <button>Foo bar</button>
      <button>Foo bar</button>
    </QCardActions>
  </QCard>

  <QLinearProgress value={30} class="q-mt-md" />

  <QCheckbox value={true} label="I'm good" class="q-mt-md" />

  <QRadio val="option1" label="Option 1" bind:selected={option} class="q-mt-md" />
  <QRadio val="option2" label="Option 2" bind:selected={option} class="q-mt-md" />
</div>
