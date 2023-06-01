<script lang="ts">
  import QCard from "$components/card/QCard.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";
  import QCardSection from "$lib/components/card/QCardSection.svelte";
  import QLinearProgress from "$lib/components/progress/QLinearProgress.svelte";
  import QCheckbox from "$lib/components/checkbox/QCheckbox.svelte";
  import QRadio from "$lib/components/radio/QRadio.svelte";
  import QInput from "$lib/components/input/QInput.svelte";
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QSeparator from "$lib/components/separator/QSeparator.svelte";
  import { Quaff } from "$lib/stores/Quaff";
  import QList from "$lib/components/list/QList.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";

  let option = "option2";
  let checkBox = false;
  let input = "";
</script>

<div style="max-width: 30em; margin: auto">
  <QCard bordered title={`Quaff version ${$Quaff.version}`}>
    <QCardSection>
      <h4>Quaff object</h4>
      <div>
        Value: {JSON.stringify($Quaff)}
      </div>
      <button on:click={() => $Quaff.dark.toggle()}>Click to toggle dark mode !</button>
    </QCardSection>
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
      <QRadio value="option1" label="Option 1" bind:selected={option} class="q-mt-md" />
      <QRadio value="option2" label="Option 2" bind:selected={option} class="q-mt-md" />
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
        <QInput bind:value={input} label="Disabled" class="q-mt-md" disabled />
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
    <QCardSection>
      <h4>Buttons</h4>
      <QBtn class="q-ma-sm" icon="favorite" label="Using Label" />
      <QBtn class="q-ma-sm">
        <span>Using</span><span style="color: blue">slot</span>
      </QBtn>
      <QBtn class="q-ma-sm" label="loading" loading />
      <QBtn class="q-ma-sm" icon="add" label="Disabled" disable />
      <QBtn class="q-ma-sm" label="Unelevated" unelevated />
      <QBtn class="q-ma-sm" label="Outline" outline />
      <QBtn class="q-ma-sm" label="Round" round />
      <QBtn class="q-ma-sm" label="Flat" flat />
    </QCardSection>
    <QCardSection>
      <h4>Toolbar</h4>
      <QToolbar class="text-primary q-mt-md">
        <QBtn icon="menu" flat round />
        <h5 class="max center-align">Title</h5>
        <QBtn flat round icon="attach_file" />
        <QBtn flat round icon="today" />
        <QBtn flat round icon="more_vert" />
      </QToolbar>
    </QCardSection>

    <QCardActions align="between">
      <button class="q-btn" disabled>Foo bar</button>
      <button>Foo bar</button>
      <a href="/about">Go to About</a>
    </QCardActions>
  </QCard>

  <QList separator bordered padding separatorOptions={{ color: "teal" }} roundedBorders>
    <div class="q-item">Hello world</div>
    <div>Not a QItem</div>
    <div class="q-item">foo</div>
    <div class="q-item">bar</div>
    <div class="q-item">
      <div>I am outside</div>
      <button>I am inside!</button>
    </div>
    <div class="q-item">Last item, no divider</div>
  </QList>
</div>
