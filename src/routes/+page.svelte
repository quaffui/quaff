<script lang="ts">
  import Quaff from "$lib/stores/Quaff.svelte";
  import KTheme from "$lib/stores/KTheme.svelte";
  import Icon from "$lib/components/icon/Icon.svelte";
  import Avatar from "$lib/components/avatar/Avatar.svelte";
  import Breadcrumbs from "$lib/components/breadcrumbs/Breadcrumbs.svelte";
  import BreadcrumbsEl from "$lib/components/breadcrumbs/BreadcrumbsEl.svelte";
  import Btn from "$lib/components/button/Btn.svelte";
  import LinearProgress from "$lib/components/progress/LinearProgress.svelte";
  import CircularProgress from "$lib/components/progress/CircularProgress.svelte";
  import Chip from "$lib/components/chip/Chip.svelte";
  import Dialog from "$lib/components/dialog/Dialog.svelte";
  import Separator from "$lib/components/separator/Separator.svelte";
  import List from "$lib/components/list/List.svelte";
  import Item from "$lib/components/list/Item.svelte";
  import ItemSection from "$lib/components/list/ItemSection.svelte";
  import Field from "$lib/components/private/field/Field.svelte";

  import CardSection from "$lib/components/card/CardSection.svelte";

  let size = $state<"xl" | "xs">("xl");
  let progressValue = $state(0);
  let showDialog = $state(false);
  let inputText = $state("");
  let multiline = $state(false);

  function randValue() {
    progressValue = Math.random() * 100;
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<Btn onclick={() => Quaff.darkMode.toggle()}>Toggle dark mode</Btn>

<div class="flex column q-ma-md">
  <h2>Icon</h2>
  <div class="flex q-gap-md items-center">
    <Icon name="check" />
    <Icon name="check" color="primary" />
    <Icon name="close" color="error" />
    <Icon name="star" size="xs" filled />
    <Icon name="star" {size} filled />
  </div>
  <Separator spacing="md" />
  <h2>Avatar</h2>
  <div class="flex q-gap-md">
    <Avatar class="primary">KP</Avatar>
    <Avatar class="secondary" shape="top-right-round">TR</Avatar>
    <Avatar class="error">BR</Avatar>
    <Avatar src="/favicon.png" />
    <Avatar src="/kapi-48.png" />
  </div>
  <Separator spacing="md" />
  <h2>Breadcrumbs</h2>
  <div class="flex q-gap-md column">
    <Breadcrumbs>
      <BreadcrumbsEl>Hello</BreadcrumbsEl>
      <BreadcrumbsEl>World</BreadcrumbsEl>
      <BreadcrumbsEl>Foo</BreadcrumbsEl>
      <BreadcrumbsEl>Bar</BreadcrumbsEl>
    </Breadcrumbs>
    <Breadcrumbs separator="icon:chevron_right">
      <BreadcrumbsEl>Hello</BreadcrumbsEl>
      <BreadcrumbsEl>World</BreadcrumbsEl>
      <BreadcrumbsEl>Foo</BreadcrumbsEl>
      <BreadcrumbsEl>Bar</BreadcrumbsEl>
    </Breadcrumbs>
    <Breadcrumbs>
      <BreadcrumbsEl icon="home" to="/">Hello</BreadcrumbsEl>
      <BreadcrumbsEl icon="grid_view" to="/world">World</BreadcrumbsEl>
      <BreadcrumbsEl icon="code" to="/foo">Foo</BreadcrumbsEl>
      <BreadcrumbsEl icon="dashboard_customize" to="/bar">Bar</BreadcrumbsEl>
    </Breadcrumbs>
  </div>
  <Separator spacing="md" />
  <h2>Btn</h2>
  <div class="flex q-gap-md">
    <Btn>Hello!</Btn>
    <Btn loading>Loading...</Btn>
    <Btn loading round />
    <Btn loading round outline />
    <Btn disabled>Disabled</Btn>
    <Btn round icon="star" />
    <Btn icon="lan">With text</Btn>
    <Btn outline>Outlined</Btn>
    <Btn flat>Flat</Btn>
    <Btn unelevated>Unelevated</Btn>
    <Btn rectangle class="error">Rectangle</Btn>
  </div>
  <Separator spacing="md" />
  <h2>Progress</h2>
  <div class="flex q-gap-md items-center">
    <Btn onclick={randValue}>Randomize value</Btn>
    <CircularProgress value={progressValue} showValue />
    <CircularProgress value={progressValue} showValue trackColor="transparent" />
    <LinearProgress value={progressValue} />
    <LinearProgress value={progressValue} size="1em" color="red" />
    <LinearProgress indeterminate />
  </div>
  <Separator spacing="md" />
  <h2>Chips</h2>
  <div class="flex q-gap-md items-center">
    <Chip>Hello!</Chip>
    <Chip disabled>Disabled</Chip>
    <Chip outlined>Outlined</Chip>
    <Chip rounded>Rounded</Chip>
    <Chip rounded icon="img:favicon.png"></Chip>
    <Chip rounded icon="star">Hello</Chip>
  </div>
  <Separator spacing="md" />
  <h2>Dialog</h2>
  <div class="flex q-gap-md items-center">
    <Btn onclick={() => (showDialog = !showDialog)} label="Click me!" />
    <Dialog bind:value={showDialog}>
      Good job, you're in
      <Btn onclick={() => (showDialog = false)} onfocus={() => console.log("Hello world")}>
        Close
      </Btn>
    </Dialog>
  </div>
  <Separator spacing="md" />
  <h2>Input</h2>
  <div class="flex q-gap-md">
    <Field bind:value={inputText} type="text" icon="search" label="Label" iconRight="close" />
    <Field
      bind:value={inputText}
      type="text"
      icon="search"
      label="Label"
      iconRight="close"
      filled
    />
    <Field
      bind:value={inputText}
      type="text"
      icon="search"
      label="Label"
      outlined
      iconRight="close"
    />
  </div>
  <Separator spacing="md" />
  <h2>List</h2>
  <div class="flex q-gap-md items-center column">
    <List separator bordered roundedBorders>
      <Item>
        <ItemSection type="icon">
          <Icon name="home" />
        </ItemSection>
        <ItemSection type="content">Leading icon, Trailing helper text</ItemSection>
        <ItemSection type="trailingText">100+</ItemSection>
      </Item>
      <Item to="/">
        <ItemSection type="avatar">
          <Avatar class="primary-container">JD</Avatar>
        </ItemSection>
        <ItemSection type="content">
          {#snippet headline()}With a link, and an avatar{/snippet}
          {#snippet line1()}Using "to"{/snippet}
        </ItemSection>
      </Item>
      <div class="error flex flex-center" style="width: 100%; border-radius: 0;">Not an Item</div>
      <Item href="/layout">
        <ItemSection type="icon">
          <Icon name="help" color="light-blue" />
        </ItemSection>
        <ItemSection type="content">
          With a link
          {#snippet line1()}Using "href"{/snippet}
          {#snippet line2()}But I have multiple lines{/snippet}
        </ItemSection>
      </Item>
      <Item>
        <ItemSection type="avatar">
          <Avatar class="primary-container">JD</Avatar>
        </ItemSection>
        <ItemSection type="content">
          With an avatar
          {#snippet line1()}I'm also a helper text{/snippet}
          {#snippet line2()}But I have multiple lines{/snippet}
          {#snippet line3()}Wow, three lines!{/snippet}
        </ItemSection>
        <ItemSection type="trailingIcon">
          <Icon name="edit" />
        </ItemSection>
      </Item>
      <Item>
        <ItemSection type="thumbnail">
          <img src="/kapi.png" alt="Alt" />
        </ItemSection>
        <ItemSection type="content">
          {#snippet headline()}With an image{/snippet}
          {#snippet line1()}And with a checkbox{/snippet}
        </ItemSection>
        <ItemSection type="trailingIcon"></ItemSection>
      </Item>
      <Item>
        <ItemSection type="video">
          <!-- svelte-ignore a11y-media-has-caption -->
          <video autoplay loop playsinline>
            <source src="/capybara.mp4" type="video/mp4" />
          </video>
        </ItemSection>
        <ItemSection type="content">
          {#snippet headline()}With a video{/snippet}
          {#snippet line1()}And with a trailing helper text{/snippet}
          {#snippet line2()}I also have multiple lines{/snippet}
        </ItemSection>
        <ItemSection type="trailingText">100+</ItemSection>
      </Item>
    </List>
  </div>
</div>
