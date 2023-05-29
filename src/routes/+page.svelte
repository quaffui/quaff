<script lang="ts">
  import QCard from "$components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
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
</div>
