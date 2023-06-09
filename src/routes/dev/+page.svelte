<script lang="ts">
  import QLayout from "$components/layout/QLayout.svelte";
  import QAvatar from "$components/avatar/QAvatar.svelte";
  import QItemSection from "$components/list/QItemSection.svelte";
  import QCard from "$components/card/QCard.svelte";
  import QCardSection from "$components/card/QCardSection.svelte";
  import QLinearProgress from "$components/progress/QLinearProgress.svelte";
  import QCheckbox from "$components/checkbox/QCheckbox.svelte";
  import QRadio from "$components/radio/QRadio.svelte";
  import QInput from "$components/input/QInput.svelte";
  import QBtn from "$components/button/QBtn.svelte";
  import QToggle from "$components/toggle/QToggle.svelte";
  import QSeparator from "$components/separator/QSeparator.svelte";
  import { Quaff } from "$lib/stores/Quaff";
  import QList from "$components/list/QList.svelte";
  import QToolbar from "$components/toolbar/QToolbar.svelte";
  import QItem from "$components/list/QItem.svelte";
  import QTooltip from "$components/tooltip/QTooltip.svelte";
  import QDrawer from "$components/drawer/QDrawer.svelte";
  import QChip from "$lib/components/chip/QChip.svelte";

  let option = "option2";
  let checkBox = false;
  let toggle = false;
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
    <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="/layout" />
  </QCard>
  <QCard title="Toggle">
    <div>
      Value: {toggle}
    </div>
    <QToggle bind:value={toggle} class="q-ma-sm" />
    <QToggle bind:value={toggle} class="q-ma-sm" label="With label" />
    <QToggle bind:value={toggle} class="q-ma-sm" icon="favorite" label="With icon" />
    <QToggle bind:value={toggle} class="q-ma-sm" leftLabel label="Left label" />
    <QToggle bind:value={toggle} class="q-ma-sm" disable label="Disable" />
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
      <QItem to="/layout">
        <i>help</i>
        <div>With a link using "to"</div>
      </QItem>
      <div>Not a QItem</div>
      <QItem href="/layout">
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
      <QItem>
        <i class="red-text">close</i>
        Last item, no divider
      </QItem>
    </QList>
  </QCard>
  <QCard title="Avatar">
    <QCardSection>
      <h6>Sizes</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar src="/cocktail.jpg" shape="circle" size="xs" />
        <QAvatar src="/cocktail.jpg" shape="circle" size="sm" />
        <QAvatar src="/cocktail.jpg" shape="circle" />
        <QAvatar src="/cocktail.jpg" shape="circle" size="lg" />
        <QAvatar src="/cocktail.jpg" shape="circle" size="xl" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Custom sizes</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar src="/cocktail.jpg" shape="circle" size="5rem" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Shapes</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar src="/cocktail.jpg" shape="circle" />
        <QAvatar src="/cocktail.jpg" shape="rounded" />
        <QAvatar src="/cocktail.jpg" shape="top-round" />
        <QAvatar src="/cocktail.jpg" shape="bottom-left-round" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Video</h6>
      <div class="flex between-align" style="align-items: center">
        <QAvatar src="/sea.mp4" shape="circle" size="lg" video />
        <QAvatar src="/sea.mp4" shape="rounded" size="lg" video />
        <QAvatar src="/sea.mp4" shape="left-round" size="lg" video />
        <QAvatar src="/sea.mp4" shape="top-right-round" size="lg" video />
      </div>
    </QCardSection>
  </QCard>
  <QCard title="Tooltip">
    <QCardSection>
      <h6>Default</h6>
      <div class="flex between-align" style="align-items: center">
        <QBtn label="Button with Tooltip">
          <QTooltip>Awesome</QTooltip>
        </QBtn>
      </div>
    </QCardSection>
    <QCardSection>
      <h6>With position</h6>
      <div class="flex between-align" style="align-items: center">
        <QBtn label="Right">
          <QTooltip position="right">Awesome</QTooltip>
        </QBtn>
        <QBtn label="Left">
          <QTooltip position="left">Awesome</QTooltip>
        </QBtn>
        <QBtn label="Top">
          <QTooltip position="top">Awesome</QTooltip>
        </QBtn>
      </div>
    </QCardSection>
  </QCard>
  <QCard title="Chips">
    <QCardSection>
      <h6>Default</h6>
      <div class="flex around-align" style="align-items: center">
        <QChip content="With content" />
        <QChip>With default slot</QChip>
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Styles</h6>
      <div class="flex around-align" style="align-items: center">
        <QChip content="I'm outlined" outlined />
        <QChip content="I'm rounded" round />
        <QChip content="I'm disabled" disable />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Size</h6>
      <div class="flex column" style="align-items: center; gap: 1em">
        <QChip content="I'm small" size="small" />
        <QChip content="I'm medium (default)" size="medium" />
        <QChip content="I'm large" size="large" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>With icons</h6>
      <div class="flex column" style="align-items: center; gap: 1em">
        <QChip content="With left icon" icon="check" />
        <QChip content="With right icon" iconRight="close" />
        <QChip content="With both icons" icon="check" iconRight="close" />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>With images</h6>
      <div class="flex column" style="align-items: center; gap: 1em">
        <QChip content="With left image" icon="img:/cocktail.jpg" />
        <QChip content="With right image" outlined iconRight="img:/cocktail.jpg" />
        <QChip content="With both images" icon="img:/cocktail.jpg" iconRight="img:/cocktail.jpg" />
        <QChip content="With left image, rounded" round icon="img:/cocktail.jpg" />
        <QChip content="With left image, responsive" responsive icon="img:/cocktail.jpg" />
        <QChip
          content="With left image, rounded and responsive!"
          round
          responsive
          icon="img:/cocktail.jpg"
        />
      </div>
    </QCardSection>
    <QCardSection>
      <h6>Click event</h6>
      <div class="flex column" style="align-items: center; gap: 1em">
        <QChip
          class="tertiary-container"
          content="Click on me!"
          responsive
          icon="img:/cocktail.jpg"
          on:click={() => alert("OMG, you actually did it")}
        />
        <QChip
          content="Can't click on me, now!"
          responsive
          disable
          icon="img:/cocktail.jpg"
          on:click={() => alert("OMG, you actually did it")}
        />
      </div>
    </QCardSection>
  </QCard>
</div>
