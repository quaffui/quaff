<script lang="ts">
  import { untrack } from "svelte";
  import QIcon from "#components/icon/QIcon.svelte";
  import QItem from "#components/list/QItem.svelte";
  import QItemSection from "#components/list/QItemSection.svelte";
  import QList from "#components/list/QList.svelte";
  import QMenu from "#components/menu/QMenu.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const direction = params.has("rtl") ? "rtl" : "ltr";
  const expressive = params.has("expressive");
  let target = $state<HTMLButtonElement>();
  let open = $state(false);
  let actionLog = $state("");
</script>

{#snippet radio()}
  <QIcon name="radio_button_unchecked" aria-hidden="true" />
{/snippet}

<main dir={direction} style="padding: 32px">
  <button bind:this={target} type="button" onclick={() => (open = true)}>Open menu</button>
  <output id="menu-action-log">{actionLog}</output>
  <QMenu bind:value={open} {target} {expressive} autoClose={false}>
    <QList>
      <QItem>
        <QItemSection action leading={radio}>Action</QItemSection>
      </QItem>
      <QItem>
        <QItemSection
          action
          role="menuitemradio"
          aria-checked={false}
          leading={radio}
          onclick={() => (actionLog += "locale;")}
        >
          <div>English</div>
          <div>United States</div>
        </QItemSection>
        <QItemSection
          action
          type="side"
          role="menuitem"
          aria-label="English settings"
          style="align-self: stretch; align-items: center; min-width: 3rem"
          onclick={() => (actionLog += "settings;")}
        >
          <QIcon name="settings" aria-hidden="true" />
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection action leading={radio}>French</QItemSection>
        <QItemSection id="passive-side" type="side">Available</QItemSection>
      </QItem>
      <QItem>
        <QItemSection action>Plain action</QItemSection>
        <QItemSection
          action
          type="side"
          role="menuitem"
          aria-label="Plain settings"
          onclick={() => (actionLog += "plain-settings;")}
        >
          <QIcon name="settings" aria-hidden="true" />
        </QItemSection>
      </QItem>
      <QItem id="responsive-item">
        <QItemSection action class="xs-hide">Hidden action</QItemSection>
        <QItemSection>Responsive label</QItemSection>
      </QItem>
      <QItem id="ordinary-item" clickable>
        <QItemSection>Ordinary item</QItemSection>
      </QItem>
    </QList>
  </QMenu>
</main>
