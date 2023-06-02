<script lang="ts">
  import QAvatar from "./../lib/components/avatar/QAvatar.svelte";
  import QItemSection from "./../lib/components/list/QItemSection.svelte";
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
  import QItem from "$lib/components/list/QItem.svelte";

  let option = "option2";
  let checkBox = false;
  let input = "";
</script>

<div style="max-width: 30em; margin: auto;">
  <QCard title="The quaff object">
    <QCardSection>
      <h6>Version</h6>
      <p>$Quaff.version: {$Quaff.version}</p>
    </QCardSection>
    <QCardSection>
      <h6>Dark mode</h6>
      <p>$Quaff.dark.isActive: {$Quaff.dark.isActive}</p>
      <div>
        <button on:click={() => $Quaff.dark.toggle()}>$Quaff.dark.toggle()</button>
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Router</h6>
      <p>$Quaff.router.data: {JSON.stringify($Quaff.router.data)}</p>
      <p>$Quaff.router.error: {$Quaff.router.error}</p>
      <p>$Quaff.router.params: {JSON.stringify($Quaff.router.params)}</p>
      <p>$Quaff.router.route: {JSON.stringify($Quaff.router.route)}</p>
      <p>$Quaff.router.status: {JSON.stringify($Quaff.router.status)}</p>
      <p>$Quaff.router.url: {JSON.stringify($Quaff.router.url)}</p>
    </QCardSection>
  </QCard>
  <QCard title="Checkbox">
    <div>
      Value: {checkBox}
    </div>
    <QCheckbox bind:value={checkBox} label="I'm good" class="q-mt-md" />
  </QCard>
  <QCard title="Radio">
    <div>
      Value: {option}
    </div>
    <QRadio value="option1" label="Option 1" bind:selected={option} class="q-mt-md" />
    <QRadio value="option2" label="Option 2" bind:selected={option} class="q-mt-md" />
  </QCard>
  <QCard title="Linear Progress">
    <QLinearProgress value={30} class="q-mt-md" />
    <QLinearProgress value={40} class="q-mt-md" from="right" rounded />
  </QCard>
  <QCard title="Separators">
    <div>
      <QSeparator spacing="md" />
      <QSeparator text="Left separator" textAlign="left" />
      <QSeparator text="Center separator" />
      <QSeparator text="Right separator" textAlign="right" spacing="md" />
    </div>
  </QCard>
  <QCard title="Inputs">
    <div>
      Value: {input}
    </div>
    <div>
      <QInput bind:value={input} label="Default" class="q-mt-md" />
      <QInput bind:value={input} label="Disabled" class="q-mt-md" disable />
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
  </QCard>
  <QCard title="Buttons">
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
  </QCard>
  <QCard title="Toolbar">
    <QToolbar class="text-primary q-mt-md">
      <QBtn icon="menu" flat round />
      <h5 class="max center-align">Title</h5>
      <QBtn flat round icon="attach_file" />
      <QBtn flat round icon="today" />
      <QBtn flat round icon="more_vert" />
    </QToolbar>
  </QCard>
  <QCard title="List">
    <QList separator bordered separatorOptions={{ spacing: "none", text: "sep" }} roundedBorders>
      <QItem>
        <QItemSection avatar>
          <i>home</i>
        </QItemSection>
        <div>Hello world</div>
      </QItem>
      <div>Not a QItem</div>
      <QItem to="/about">
        <i>help</i>
        <div>With a link using "to"</div>
      </QItem>
      <QItem href="/about">
        <i>help</i>
        <div>With a link using "href"</div>
      </QItem>
      <QItem>
        <i class="light-green-text">check_circle</i>
        <div class="max">Some text here</div>
        <a>
          <i>edit</i>
        </a>
        <a>
          <i>delete</i>
        </a>
      </QItem>
      <QItem>Last item, no divider</QItem>
    </QList>
  </QCard>
  <QCard title="Avatar">
    <QCardSection>
      <h6>Sizes</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar shape="circle" size="xs" />
        <QAvatar shape="circle" size="sm" />
        <QAvatar shape="circle" />
        <QAvatar shape="circle" size="lg" />
        <QAvatar shape="circle" size="xl" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Shapes</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar shape="circle" />
        <QAvatar shape="rounded" />
        <QAvatar shape="top-round" />
        <QAvatar shape="bottom-left-round" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Video</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar shape="circle" size="lg" video />
        <QAvatar shape="rounded" size="lg" video />
        <QAvatar shape="left-round" size="lg" video />
        <QAvatar shape="top-right-round" size="lg" video />
      </div>
    </QCardSection>
  </QCard>
</div>
