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
    noRotateExpandIcon = false,
    disabled = false,
    noRipple = false,
    summary,
    children,
    onExpandIconClick,
    ...props
  }: QExpansionItemProps = $props();

  const id = $props.id();
  const contentId = `q-expansion-item__content-${id}`;
  const summaryId = `q-expansion-item__summary-${id}`;

  const supportDetailsContent = CSS.supports("selector(details::details-content)");

  const summaryAttributes = $derived(
    !supportDetailsContent
      ? {
          id: summaryId,
          "aria-expanded": value,
          "aria-controls": contentId,
        }
      : {}
  );

  const contentAttributes = $derived(
    !supportDetailsContent
      ? {
          id: contentId,
          role: "region",
          "aria-labelledby": summaryId,
        }
      : {}
  );

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

  $effect(() => {
    if (supportDetailsContent || !name || !value) {
      return;
    }

    // If the browser does not support details content, we need to manually
    // handle the group open state of the details elements
    const parent = detailsEl?.parentElement;

    if (!parent) {
      return;
    }

    const group = parent.querySelectorAll("details[open]");
    group.forEach((item) => {
      if (item !== detailsEl) {
        item.removeAttribute("open");
      }
    });
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
      rotate: value && !expandedIcon && !noRotateExpandIcon,
    },
  });

  function onclick(e: QEvent<MouseEvent, HTMLElement>) {
    console.log("QExpansionItem: onclick", e);
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    props.onclick?.(e);
  }

  function onIconClick(e: QEvent<MouseEvent, HTMLElement>) {
    if (disabled) {
      e.preventDefault();
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    toggle();
    onExpandIconClick?.(e);
  }

  function onkeydown(e: KeyboardEvent) {
    if (disabled) {
      e.preventDefault();
      return;
    }

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
    if (disabled) {
      e.preventDefault();
      return;
    }

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

{#snippet content()}
  {#if value}
    <div class="q-expansion-item__content" {...contentAttributes} transition:slide={{ duration }}>
      {@render children?.()}
    </div>
  {/if}
{/snippet}

<details
  bind:this={detailsEl}
  bind:open={value}
  {...props}
  {name}
  aria-disabled={disabled}
  class="q-expansion-item"
  style:--duration="{duration}ms"
>
  <summary tabindex="-1" {...summaryAttributes}>
    {#if summary}
      <QItem
        {dense}
        {to}
        {href}
        {disabled}
        noRipple={expandIconToggle || noRipple}
        clickable={!expandIconToggle}
        {onclick}
        {onkeydown}
      >
        {@render summary({ expanded: value, show, hide, toggle })}
      </QItem>
    {:else}
      <QItem
        {dense}
        {to}
        {href}
        {disabled}
        noRipple={expandIconToggle || noRipple}
        clickable={!expandIconToggle}
        {onclick}
        {onkeydown}
      >
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
                {disabled}
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

  {#if supportDetailsContent}
    {@render content()}
  {/if}
</details>

{#if !supportDetailsContent}
  {@render content()}
{/if}
