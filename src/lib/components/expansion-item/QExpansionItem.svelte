<script lang="ts">
  import { slide } from "svelte/transition";
  import QBtn from "$components/button/QBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QItem from "$components/list/QItem.svelte";
  import QItemSection from "$components/list/QItemSection.svelte";
  import { getActionableEventHandlers } from "$utils";
  import type { QExpansionItemProps } from "./props";

  // #region:    --- Props
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
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const id = $props.id();
  const contentId = `q-expansion-item__content-${id}`;
  const summaryId = `q-expansion-item__summary-${id}`;
  const supportDetailsContent =
    typeof CSS !== "undefined" && CSS.supports("selector(details::details-content)");
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let detailsEl = $state<HTMLDetailsElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
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

  const iconAttributes = $derived({
    [expandIconToggle ? "icon" : "name"]: expandedIcon && value ? expandedIcon : expandIcon,
    flat: expandIconToggle || undefined,
    "aria-label": toggleAriaLabel,
  });

  const toggleIconHandlers = $derived(
    getActionableEventHandlers(
      { disabled, onclick: onExpandIconClick },
      {
        onAction(e) {
          e.stopPropagation();
          e.preventDefault();

          toggle();
        },
      }
    )
  );
  // #endregion: --- Derived values

  // #region:    --- Effects
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
  // #endregion: --- Effects

  // #region:    --- Methods
  export function toggle() {
    value = !value;
  }

  export function show() {
    value = true;
  }

  export function hide() {
    value = false;
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function preventAndStop<T extends Event>(e: T) {
    e.preventDefault();
    e.stopPropagation();
  }
  // #endregion: --- Functions

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
  aria-disabled={disabled || undefined}
  class="q-expansion-item"
  style:--duration="{duration}ms"
>
  <summary tabindex={-1} {...summaryAttributes} onmousedown={disabled ? preventAndStop : undefined}>
    {#if summary}
      <QItem
        {dense}
        {to}
        {href}
        {disabled}
        noRipple={expandIconToggle || noRipple}
        clickable={!expandIconToggle}
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
                onclick={toggleIconHandlers.onclick}
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
