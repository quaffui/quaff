<script lang="ts">
  import { slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { QBtn, QIcon, QItem, QItemSection } from "$components";
  import { isActivationKey, type QEvent } from "$utils";
  import type { QExpansionItemProps } from "./props";

  let {
    value = $bindable(false),
    label,
    icon,
    caption,
    expandIcon = "keyboard_arrow_down",
    expandedIcon,
    defaultOpened = false,
    dense = false,
    duration = 300,
    hideExpandIcon = false,
    toggleAriaLabel = "Open details",
    expandIconToggle = false,
    to,
    href,
    name,
    summary,
    children,
    onExpandIconClick,
    ...props
  }: QExpansionItemProps = $props();

  let detailsEl = $state<HTMLDetailsElement>();

  const iconAttributes = $derived({
    [expandIconToggle ? "icon" : "name"]: expandedIcon && value ? expandedIcon : expandIcon,
    flat: expandIconToggle || undefined,
    "aria-label": toggleAriaLabel,
  });

  $effect.pre(() => {
    if (defaultOpened) {
      show();
    }
  });

  export function toggle() {
    value = !value;
  }

  export function show() {
    value = true;
  }

  export function hide() {
    value = false;
  }

  Q.classes("q-expansion-item", {
    bemClasses: {
      expanded: value,
    },
  });

  Q.classes("q-expansion-item__toggle-icon", {
    bemClasses: {
      rotate: value && !expandedIcon,
    },
  });

  function onclick(e: QEvent<MouseEvent, HTMLElement>) {
    props.onclick?.(e);
  }

  function onIconClick(e: QEvent<MouseEvent, HTMLElement>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    toggle();
    onExpandIconClick?.(e);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      detailsEl?.blur();
      return;
    }

    if (!isActivationKey(e)) {
      return;
    }

    if (to || href) {
      e.preventDefault();
      goto((to || href) as string);
      return;
    }

    if (expandIconToggle) {
      // If expandIconToggle is true, we don't want to toggle the expansion item
      // as the icon should do it
      return;
    }

    e.preventDefault();
    toggle();
  }

  function onIconKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      (e.target as HTMLElement)?.blur();
      return;
    }

    if (!isActivationKey(e) || !expandIconToggle) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const clickEvent = new MouseEvent("click", {
      relatedTarget: e.target as HTMLElement,
    }) as QEvent<MouseEvent, HTMLElement>;
    onIconClick(clickEvent);
  }
</script>

{#snippet labelSnippet()}
  {label}
{/snippet}

{#snippet captionSnippet()}
  {caption}
{/snippet}

<details
  bind:this={detailsEl}
  bind:open={value}
  {...props}
  {name}
  class="q-expansion-item"
  style:--duration="{duration}ms"
>
  <summary tabindex="-1">
    {#if summary}
      <QItem {dense} {to} {href} clickable={!expandIconToggle} {onclick} {onkeydown}>
        {@render summary({ expanded: value, show, hide, toggle })}
      </QItem>
    {:else}
      <QItem {dense} {to} {href} clickable={!expandIconToggle} {onclick} {onkeydown}>
        {#if icon}
          <QItemSection type="icon">
            <QIcon name={icon} />
          </QItemSection>
        {/if}

        {#if label || caption}
          <QItemSection
            headline={label ? labelSnippet : undefined}
            line1={caption ? captionSnippet : undefined}
          />
        {/if}

        {#if !hideExpandIcon}
          <QItemSection type="trailingIcon">
            {#if expandIconToggle}
              <QBtn
                class="q-expansion-item__toggle-icon"
                {...iconAttributes}
                color="on-surface"
                tag="div"
                tabindex={0}
                onclick={onIconClick}
                onkeydowncapture={onIconKeydown}
              />
            {:else}
              <QIcon class="q-expansion-item__toggle-icon" {...iconAttributes} />
            {/if}
          </QItemSection>
        {/if}
      </QItem>
    {/if}
  </summary>

  {#if value}
    <div class="q-expansion-item__content" transition:slide={{ duration }}>
      {@render children?.()}
    </div>
  {/if}
</details>
