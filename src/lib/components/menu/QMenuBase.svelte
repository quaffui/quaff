<script lang="ts">
  import { onMount } from "svelte";
  import { QList, QItem, QItemSection, QIcon, QSeparator, QTooltip } from "$components";
  import type { MenuProps } from "./props";

  interface Props extends MenuProps {
    translateStyle: () => string | undefined;
  }

  let {
    value = $bindable(false),
    target,
    items = [],
    position = "bottom",
    cover = false,
    fit = false,
    id,
    translateStyle,
    children,
    ...props
  }: Props = $props();

  let menuEl = $state<HTMLDivElement>();

  function updatePopoverFn(type: "show" | "hide" | "toggle") {
    if (!menuEl) {
      return;
    }

    return menuEl[`${type}Popover`];
  }

  export const open = updatePopoverFn("show");
  export const close = updatePopoverFn("hide");
  export const toggle = updatePopoverFn("toggle");

  Q.classes("q-menu", {
    bemClasses: {
      [position]: true,
      cover,
      fit,
    },
  });
</script>

<div
  bind:this={menuEl}
  {...props}
  class="q-menu"
  {id}
  popover="auto"
  data-quaff
  style:translate={translateStyle()}
>
  <QList>
    {#each items as item, i (i)}
      {#if item === "separator"}
        <QSeparator spacing="sm" />
      {:else if typeof item === "string"}
        <div class="q-menu__section-title">{item}</div>
      {:else}
        <QItem clickable disabled={item.disabled} onclick={item.onclick}>
          {#if item.icon}
            <QItemSection type="icon">
              <QIcon name={item.icon} />
            </QItemSection>
          {/if}

          <QItemSection>
            {item.label}
          </QItemSection>

          {#if item.trailingIcon}
            <QItemSection type="trailingIcon">
              <QIcon name={item.trailingIcon} />
            </QItemSection>
          {/if}

          {#if item.tooltip}
            {#if typeof item.tooltip === "string"}
              <QTooltip position="right">{item.tooltip}</QTooltip>
            {:else}
              <QTooltip position={item.tooltip.position || "right"}>
                {item.tooltip.label}
              </QTooltip>
            {/if}
          {/if}
        </QItem>
      {/if}
    {/each}
  </QList>
</div>
