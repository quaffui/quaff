<script lang="ts">
  import QCard from "$components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
  import QLinearProgress from "$lib/components/progress/QLinearProgress.svelte";
  import QCheckbox from "$lib/components/checkbox/QCheckbox.svelte";
  import QRadio from "$lib/components/radio/QRadio.svelte";
  import QInput from "$lib/components/input/QInput.svelte";
  import QSeparator from "$lib/components/separator/QSeparator.svelte";

  let option = "option2";
  let checkBox = false;
  let input = "";
</script>

<div style="max-width: 30em; margin: auto">
  <QCard bordered title="Hello world">
    <QCardSection>
      <h4>CheckBox</h4>
      <div>
        Value: {checkBox}
      </div>
      <QCheckbox bind:value={checkBox} label="I'm good" class="q-mt-md" />
    </QCardSection>
    <QCardSection>
      <h4>Radio</h4>
      <div>
        Value: {option}
      </div>
      <QRadio val="option1" label="Option 1" bind:selected={option} class="q-mt-md" />
      <QRadio val="option2" label="Option 2" bind:selected={option} class="q-mt-md" />
    </QCardSection>
    <QCardSection>
      <h4>Linear Progress</h4>
      <QLinearProgress value={30} class="q-mt-md" />
      <QLinearProgress value={40} class="q-mt-md" from="right" rounded />
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
    <QCardSection>
      <h4>Inputs</h4>
      <div>
        Value: {input}
      </div>
      <div>
        <QInput bind:value={input} label="Default" class="q-mt-md" />
        <QInput bind:value={input} rounded label="Rounded" class="q-mt-md" />
        <QInput
          bind:value={input}
          bordered
          class="q-mt-md"
          label="Bordered with hint"
          hint="This is a hint"
        />
        <QInput
          bind:value={input}
          bordered
          class="q-mt-md"
          label="Error state"
          error
          errorMessage="A custom error message"
        />
        <QInput bind:value={input} outlined class="q-mt-md" label="Outlined" />
        <QInput bind:value={input} outlined class="q-mt-md" label="Outlined with prepended icon">
          <i slot="prepend">search</i>
        </QInput>
        <QInput bind:value={input} outlined class="q-mt-md" label="Rounded with appended icon">
          <i slot="append">list</i>
        </QInput>
      </div>
    </QCardSection>
    <QCardActions align="between">
      <button>Foo bar</button>
      <button>Foo bar</button>
    </QCardActions>
  </QCard>
</div>
