<script lang="ts">
  import {
    QDialog,
    QCard,
    QCardSection,
    QCheckbox,
    QRadio,
    QLinearProgress,
    QSeparator,
    QInput,
    QSelect,
    QBtn,
    QToggle,
    QToolbar,
    QToolbarTitle,
    QList,
    QItem,
    QItemSection,
    QAvatar,
    QTooltip,
    QChip,
    QTabs,
    QTab,
    QIcon,
  } from "$lib";
  import { Quaff } from "$lib/stores/Quaff";
  import QBreadcrumbs from "$lib/components/breadcrumbs/QBreadcrumbs.svelte";
  import QBreadcrumbsEl from "$lib/components/breadcrumbs/QBreadcrumbsEl.svelte";
  import QCardActions from "$lib/components/card/QCardActions.svelte";

  let option = "option2";
  let checkBox = false;
  let toggle = false;
  let input = "";
  let activeTab = "foo";
  let select = "";
  let selectMultiple: string[] = [];
  let options = ["Cats", "Dogs", "Capybaras"];

  let dialog1 = false;
  let dialog2 = false;
  let dialog3 = false;
  let dialog4 = false;
  let dialog5 = false;
  let dialog6 = false;
  let dialog7 = false;
  let dialogElement1: QDialog;
  let dialogElement2: QDialog;
  let dialogElement3: QDialog;
  let dialogElement4: QDialog;
  let dialogElement5: QDialog;
  let dialogElement6: QDialog;
  let dialogElement7: QDialog;
</script>

<div class="q-page" style="max-width: 40rem;">
  <div class="row q-gutter-lg">
    <div class="col-12">
      <QCard title="Tabs">
        <QCardSection>
          Value: {activeTab}
        </QCardSection>
        <QCardSection>
          <h6>Primary tabs</h6>
          <QTabs bind:value={activeTab}>
            <QTab name="hello">Hello</QTab>
            <QTab name="world">World</QTab>
            <QTab name="foo">Foo</QTab>
            <QTab name="bar">Bar</QTab>
          </QTabs>
        </QCardSection>
        <QCardSection>
          <h6>Secondary tabs</h6>
          <QTabs bind:value={activeTab} variant="secondary">
            <QTab name="hello">Hello</QTab>
            <QTab name="foo">Foo</QTab>
            <QTab name="world">World</QTab>
            <QTab name="bar">Bar</QTab>
          </QTabs>
        </QCardSection>
        <QCardSection>
          <h6>Vertical tabs</h6>
          <QTabs bind:value={activeTab} variant="vertical">
            <QTab icon="favorite" name="foo">Foo</QTab>
            <QTab icon="star" name="bar">Bar</QTab>
            <QTab icon="home" name="hello">Hello</QTab>
            <QTab icon="help" name="world">World</QTab>
          </QTabs>
        </QCardSection>
        <QCardSection>
          <h6>With icon</h6>
          <QTabs bind:value={activeTab}>
            <QTab icon="favorite" name="foo">Foo</QTab>
            <QTab icon="home" name="hello">Hello</QTab>
            <QTab icon="star" name="bar">Bar</QTab>
            <QTab icon="help" name="world">World</QTab>
          </QTabs>
        </QCardSection>
        <QCardSection>
          <h6>With router links</h6>
          <QTabs>
            <QTab name="home" icon="home" to="/">Home</QTab>
            <QTab name="components" icon="grid_view" to="/components">Components</QTab>
            <QTab name="utils" icon="construction" to="/utils">Utils</QTab>
            <QTab name="dev" icon="code" to="/dev">Dev</QTab>
            <QTab name="layout" icon="dashboard_customize" to="/layout">Layout tests</QTab>
          </QTabs>
        </QCardSection>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="The quaff object">
        <QCardSection>
          <h6>Version</h6>
          <p>$Quaff.version: {$Quaff.version}</p>
        </QCardSection>
        <QCardSection>
          <h6>Dark mode</h6>
          <p>$Quaff.dark.isActive: {$Quaff.dark.isActive}</p>
          <div>
            <QBtn on:click={() => $Quaff.dark.toggle()}>$Quaff.dark.toggle()</QBtn>
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
    </div>
    <div class="col-12">
      <QCard title="Checkbox">
        <div>
          Value: {checkBox}
        </div>
        <QCheckbox bind:value={checkBox} label="I'm good" class="q-mt-md" />
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Radio">
        <div>
          Value: {option}
        </div>
        <QRadio value="option1" label="Option 1" bind:selected={option} class="q-mt-md" />
        <QRadio value="option2" label="Option 2" bind:selected={option} class="q-mt-md" />
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Linear Progress">
        <QLinearProgress value={30} class="q-mt-md" />
        <QLinearProgress value={40} class="q-mt-md" from="right" rounded />
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Separators">
        <div>
          <QSeparator spacing="md" />
          <QSeparator text="Left separator" textAlign="left" />
          <QSeparator text="Center separator" />
          <QSeparator text="Right separator" textAlign="right" spacing="md" />
          <QSeparator spacing="md" text="inset" inset />
        </div>
        <QCardSection class="row q-gutter-md" style="height: 10rem">
          <div class="col-4 flex flex-center">Me</div>
          <QSeparator class="col-4" spacing="md" text="My procrastination" vertical />
          <div class="col-4 flex flex-center">Finishing my projects</div>
        </QCardSection>
      </QCard>
    </div>
    <div class="col-12">
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
            <QIcon slot="prepend" name="search" />
          </QInput>
          <QInput bind:value={input} outlined class="q-mt-md" label="Rounded with appended icon">
            <QIcon slot="append" name="list" />
          </QInput>
        </div>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Select">
        <div>
          <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
          <QSelect
            bind:value={selectMultiple}
            {options}
            label="Multiple"
            class="q-mt-md"
            multiple
          />
          <QSelect bind:value={select} {options} label="Disabled" class="q-mt-md" disable />
          <QSelect bind:value={select} {options} rounded label="Rounded" class="q-mt-md" disable />
          <QSelect
            bind:value={select}
            {options}
            bordered
            class="q-mt-md"
            label="Bordered with hint"
            hint="This is a hint"
          />
          <QSelect
            bind:value={select}
            {options}
            bordered
            class="q-mt-md"
            label="Error state"
            error
            errorMessage="A custom error message"
          />
          <QSelect bind:value={select} {options} outlined class="q-mt-md" label="Outlined" />
          <QSelect
            bind:value={select}
            {options}
            outlined
            class="q-mt-md"
            label="Outlined with prepended icon"
          >
            <QIcon slot="prepend" name="favorite" />
          </QSelect>
          <QSelect
            bind:value={select}
            {options}
            rounded
            class="q-mt-md"
            label="Rounded with appended icon"
          >
            <QIcon slot="append" name="list" />
          </QSelect>
        </div>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Buttons">
        <QBtn
          class="q-ma-sm"
          icon="favorite"
          label="Using Label"
          on:activated={() => alert("Hey you clicked")}
        />
        <QBtn class="q-ma-sm">
          <span>Using</span><span style="color: blue">slot</span>
        </QBtn>
        <QBtn class="q-ma-sm" label="loading" loading />
        <QBtn
          class="q-ma-sm"
          icon="add"
          label="Disabled"
          disable
          on:activated={() => alert("Hey you clicked")}
        />
        <QBtn class="q-ma-sm" label="Unelevated" unelevated />
        <QBtn class="q-ma-sm" label="Outline" outline />
        <QBtn class="q-ma-sm" label="Rectangle" rectangle />
        <QBtn class="q-ma-sm" label="Flat" flat />
        <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="/layout" />
      </QCard>
    </div>
    <div class="col-12">
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
    </div>
    <div class="col-12">
      <QCard title="Toolbar">
        <QToolbar class="text-primary q-mt-md">
          <QBtn icon="menu" flat />
          <QToolbarTitle>Title</QToolbarTitle>
          <QBtn flat icon="attach_file" />
          <QBtn flat icon="today" />
          <QBtn flat icon="more_vert" />
        </QToolbar>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="List">
        <QList separator bordered roundedBorders>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="home" />
            </QItemSection>
            <QItemSection type="content">
              <svelte:fragment slot="headline">Leading icon, Trailing helper text</svelte:fragment>
            </QItemSection>
            <QItemSection type="trailingText">100+</QItemSection>
          </QItem>
          <QItem to="/layout">
            <QItemSection type="avatar">
              <QAvatar class="primary-container">JD</QAvatar>
            </QItemSection>
            <QItemSection type="content">
              <svelte:fragment slot="headline">With a link, and an avatar</svelte:fragment>
              <svelte:fragment slot="line1">Using "to"</svelte:fragment>
            </QItemSection>
          </QItem>
          <div>Not a QItem</div>
          <QItem href="/layout">
            <QItemSection type="icon">
              <QIcon name="help" color="light-blue" />
            </QItemSection>
            <QItemSection type="content">
              <svelte:fragment slot="headline">With a link</svelte:fragment>
              <svelte:fragment slot="line1">Using "href"</svelte:fragment>
              <svelte:fragment slot="line2">But I have multiple lines</svelte:fragment>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="avatar">
              <QAvatar class="primary-container">JD</QAvatar>
            </QItemSection>
            <QItemSection type="content">
              <svelte:fragment slot="headline">With an avatar</svelte:fragment>
              <svelte:fragment slot="line1">Using "href", I'm also a helper text</svelte:fragment>
              <svelte:fragment slot="line2">But I have multiple lines</svelte:fragment>
              <svelte:fragment slot="line3">Wow, three lines</svelte:fragment>
            </QItemSection>
            <QItemSection type="trailingIcon">
              <QIcon name="edit" />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="thumbnail">
              <img
                src="/cocktail.jpg"
                alt="Pink and yellow cocktails with a straws and mint leaves"
              />
            </QItemSection>
            <QItemSection type="content">
              <svelte:fragment slot="headline">With an image</svelte:fragment>
              <svelte:fragment slot="line1">And with a checkbox</svelte:fragment>
            </QItemSection>
            <QItemSection type="trailingIcon">
              <QCheckbox />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="video">
              <!-- svelte-ignore a11y-media-has-caption -->
              <video autoplay loop playsinline>
                <source src="/sea.mp4" type="video/mp4" />
              </video>
            </QItemSection>
            <QItemSection type="content">
              <svelte:fragment slot="headline">With a video</svelte:fragment>
              <svelte:fragment slot="line1">And with a trailing helper text</svelte:fragment>
              <svelte:fragment slot="line2">I also have multiple lines</svelte:fragment>
            </QItemSection>
            <QItemSection type="trailingText">100+</QItemSection>
          </QItem>
        </QList>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Avatar">
        <QCardSection>
          <h6>Sizes</h6>
          <div class="flex justify-between" style="align-items: center">
            <QAvatar src="/cocktail.jpg" shape="circle" size="xs" />
            <QAvatar src="/cocktail.jpg" shape="circle" size="sm" />
            <QAvatar src="/cocktail.jpg" shape="circle" />
            <QAvatar src="/cocktail.jpg" shape="circle" size="lg" />
            <QAvatar src="/cocktail.jpg" shape="circle" size="xl" />
          </div>
        </QCardSection>
        <QCardSection>
          <h6>Custom sizes</h6>
          <div class="flex justify-between" style="align-items: center">
            <QAvatar src="/cocktail.jpg" shape="circle" size="5rem" />
          </div>
        </QCardSection>
        <QCardSection>
          <h6>Shapes</h6>
          <div class="flex justify-between" style="align-items: center">
            <QAvatar src="/cocktail.jpg" shape="circle" />
            <QAvatar src="/cocktail.jpg" shape="rounded" />
            <QAvatar src="/cocktail.jpg" shape="top-round" />
            <QAvatar src="/cocktail.jpg" shape="bottom-left-round" />
          </div>
        </QCardSection>
        <QCardSection>
          <h6>Video</h6>
          <div class="flex justify-between" style="align-items: center">
            <QAvatar src="/sea.mp4" shape="circle" size="lg" video />
            <QAvatar src="/sea.mp4" shape="rounded" size="lg" video />
            <QAvatar src="/sea.mp4" shape="left-round" size="lg" video />
            <QAvatar src="/sea.mp4" shape="top-right-round" size="lg" video />
          </div>
        </QCardSection>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Tooltip">
        <QCardSection>
          <h6>Default</h6>
          <div class="flex justify-between" style="align-items: center">
            <QBtn label="Button with Tooltip">
              <QTooltip>Awesome</QTooltip>
            </QBtn>
          </div>
        </QCardSection>
        <QCardSection>
          <h6>With position</h6>
          <div class="flex justify-between" style="align-items: center">
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
        <QCardSection>
          <h6>Rich tooltip</h6>
          <div class="flex justify-between" style="align-items: center">
            <QBtn label="I'm rich">
              <QTooltip position="right" class="q-pa-none">
                <QCard title="Wow this is a card" class="primary-container no-round">
                  <QCardSection class="items-center">
                    <QIcon name="help" class="q-mr-md" />
                    I'm inside the tooltip
                  </QCardSection>
                  <QCardActions>
                    <QBtn>Cancel</QBtn>
                    <QBtn>Confirm</QBtn>
                  </QCardActions>
                </QCard>
              </QTooltip>
            </QBtn>
          </div>
        </QCardSection>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Chips">
        <QCardSection>
          <h6>Default</h6>
          <div class="flex justify-around" style="align-items: center">
            <QChip content="With content" />
            <QChip>With default slot</QChip>
          </div>
        </QCardSection>
        <QCardSection>
          <h6>Styles</h6>
          <div class="flex justify-around" style="align-items: center">
            <QChip content="I'm outlined" outlined />
            <QChip content="I'm rounded" round />
            <QChip content="I'm disabled" disable />
          </div>
        </QCardSection>
        <QCardSection>
          <h6>Size</h6>
          <div class="flex column" style="align-items: center; gap: 1em">
            <QChip content="I'm small" size="sm" />
            <QChip content="I'm medium (default)" size="md" />
            <QChip content="I'm large" size="lg" />
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
            <QChip
              content="With both images"
              icon="img:/cocktail.jpg"
              iconRight="img:/cocktail.jpg"
            />
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
    <div class="col-12">
      <QCard title="Dialogs">
        <QCardSection>
          <h6>Basics</h6>
          <QDialog bind:value={dialog1} bind:this={dialogElement1} btnContent="Default dialog">
            <h5>This is a dialog</h5>
            <div>Some text here</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => dialogElement1.hide()} label="Cancel" />
              <QBtn on:click={() => dialogElement1.hide()} label="Confirm" />
            </nav>
          </QDialog>
          <QDialog modal bind:value={dialog2} btnContent="Modal dialog">
            <h5>This is a modal dialog</h5>
            <div>Some text here</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => (dialog2 = false)} label="Cancel" />
              <QBtn on:click={() => (dialog2 = false)} label="Confirm" />
            </nav>
          </QDialog>
          <QDialog modal bind:value={dialog3} btnContent="Persistent dialog" persistent>
            <h5>This is a dialog</h5>
            <div>This time, I am persistent</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => (dialog3 = false)} label="Cancel" />
              <QBtn on:click={() => (dialog3 = false)} label="Confirm" />
            </nav>
          </QDialog>
        </QCardSection>
        <QCardSection>
          <h6>Position</h6>
          <QDialog modal bind:value={dialog4} btnContent="Top" position="top">
            <h5>This is a dialog</h5>
            <div>I'm chilling on top!</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => (dialog4 = false)} label="Cancel" />
              <QBtn on:click={() => (dialog4 = false)} label="Confirm" />
            </nav>
          </QDialog>
          <QDialog modal bind:value={dialog5} btnContent="Right" position="right">
            <h5>This is a dialog</h5>
            <div>I'm chilling on right!</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => (dialog5 = false)} label="Cancel" />
              <QBtn on:click={() => (dialog5 = false)} label="Confirm" />
            </nav>
          </QDialog>
          <QDialog modal bind:value={dialog6} btnContent="Bottom" position="bottom">
            <h5>This is a dialog</h5>
            <div>I'm chilling on bottom!</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => (dialog6 = false)} label="Cancel" />
              <QBtn on:click={() => (dialog6 = false)} label="Confirm" />
            </nav>
          </QDialog>
          <QDialog modal bind:value={dialog7} btnContent="Left" position="left">
            <h5>This is a dialog</h5>
            <div>I'm chilling on left!</div>
            <nav class="flex justify-end">
              <QBtn on:click={() => (dialog7 = false)} label="Cancel" />
              <QBtn on:click={() => (dialog7 = false)} label="Confirm" />
            </nav>
          </QDialog>
        </QCardSection>
      </QCard>
    </div>
    <div class="col-12">
      <QCard title="Breadcrumbs">
        <QCardSection>
          <h6>Default breadcrumbs</h6>
          <QBreadcrumbs>
            <QBreadcrumbsEl>Hello</QBreadcrumbsEl>
            <QBreadcrumbsEl>World</QBreadcrumbsEl>
            <QBreadcrumbsEl>Foo</QBreadcrumbsEl>
            <QBreadcrumbsEl>Bar</QBreadcrumbsEl>
          </QBreadcrumbs>
        </QCardSection>
        <QCardSection>
          <h6>With icons</h6>
          <QBreadcrumbs>
            <QBreadcrumbsEl icon="home">Hello</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="favorite">World</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="star">Foo</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="help">Bar</QBreadcrumbsEl>
          </QBreadcrumbs>
        </QCardSection>
        <QCardSection>
          <h6>Custom separator</h6>
          <h6 class="small q-ml-md">With text</h6>
          <QBreadcrumbs separator="|">
            <QBreadcrumbsEl>Hello</QBreadcrumbsEl>
            <QBreadcrumbsEl>World</QBreadcrumbsEl>
            <QBreadcrumbsEl>Foo</QBreadcrumbsEl>
            <QBreadcrumbsEl>Bar</QBreadcrumbsEl>
          </QBreadcrumbs>
          <h6 class="small q-ml-md">With icon</h6>
          <QBreadcrumbs separator="icon:chevron_right">
            <QBreadcrumbsEl>Hello</QBreadcrumbsEl>
            <QBreadcrumbsEl>World</QBreadcrumbsEl>
            <QBreadcrumbsEl>Foo</QBreadcrumbsEl>
            <QBreadcrumbsEl>Bar</QBreadcrumbsEl>
          </QBreadcrumbs>
        </QCardSection>
        <QCardSection>
          <h6>With links</h6>
          <QBreadcrumbs>
            <QBreadcrumbsEl icon="home" to="/">Home</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="grid_view" to="/components">Components</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="construction" to="/utils">Utils</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="code" to="/dev">Dev</QBreadcrumbsEl>
            <QBreadcrumbsEl icon="dashboard_customize" to="/layout">Layout tests</QBreadcrumbsEl>
          </QBreadcrumbs>
        </QCardSection>
      </QCard>
    </div>
  </div>
</div>
