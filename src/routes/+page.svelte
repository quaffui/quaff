<script lang="ts">
  import QCard from "$components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
  import QLinearProgress from "$lib/components/progress/QLinearProgress.svelte";
  import QCheckbox from "$lib/components/checkbox/QCheckbox.svelte";
  import QRadio from "$lib/components/radio/QRadio.svelte";
  import QSeparator from "$lib/components/separator/QSeparator.svelte";

  let option = "option2";
  let checkBox = false;
</script>

<div style="max-width: 30em; margin: auto">
  <QCard bordered title="Hello world">
    <QCardSection>
      <h4>CheckBox</h4>
      <QCheckbox bind:value={checkBox} label="I'm good" class="q-mt-md" />
      <div>
        {checkBox}
      </div>
    </QCardSection>
    <QCardSection>
      <h4>Radio</h4>
      <QRadio val="option1" label="Option 1" bind:selected={option} class="q-mt-md" />
      <QRadio val="option2" label="Option 2" bind:selected={option} class="q-mt-md" />
      <div>
        {option}
      </div>
    </QCardSection>
    <QCardSection>
      <h4>Separators</h4>
      <div>
        <QSeparator spacing="md" />
        <QSeparator text="Left separator" textAlign="left" />
        <QSeparator text="Center separator" />
        <QSeparator text="Right separator" textAlign="right" spacing="md" />
      </div>
    </QCardSection>
    <QCardActions align="between">
      <button>Foo bar</button>
      <button>Foo bar</button>
    </QCardActions>
  </QCard>

  <QLinearProgress value={30} class="q-mt-md" />
</div>
