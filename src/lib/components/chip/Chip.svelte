<script lang="ts">
  import { useSize } from "$lib/composables/use-size";
  import { ripple } from "$lib/helpers";
  import { isActivationKey } from "$lib/utils/events";
  import { extractImgSrc } from "$lib/utils/string";
  import Icon from "../icon/Icon.svelte";
  import type { ChipProps } from "./props";

  let {
    content,
    icon,
    iconRight,
    disabled = false,
    responsive = false,
    vertical = false,
    rounded = false,
    outlined = false,
    noRipple = false,
    size = "md",
    tabindex,
    // Events
    onclick,
    // Snippets
    children,
    leading = leadingFallback,
    trailing = trailingFallback,
    ...props
  }: ChipProps = $props();

  let chipEl: HTMLAnchorElement;

  const img = $derived(extractImgSrc(icon));
  const imgRight = $derived(extractImgSrc(iconRight));

  const kSize = $derived(useSize(size, "q-chip"));

  const tab = $derived(disabled ? -1 : tabindex || 0);

  function stopIfDisabled(e: MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    onclick?.(e);
  }

  function onKeyDown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLAnchorElement }) {
    if (!isActivationKey(e)) return;

    e.preventDefault();

    const click = new MouseEvent("click");
    chipEl.dispatchEvent(click);
  }

  Quaff.classes("q-chip", {
    bemClasses: {
      vertical,
      rounded,
      outlined,
    },
    classes: [kSize.class, props.class],
  });
</script>

<a
  bind:this={chipEl}
  use:ripple={{ disabled: noRipple || disabled }}
  {...props}
  class="q-chip"
  {...Quaff.classes}
  aria-disabled={disabled || undefined}
  role="button"
  tabindex={tab}
  onkeydown={onKeyDown}
  onclick={stopIfDisabled}
>
  {@render leading()}

  {#if content}
    {content}
  {:else}
    {@render children?.()}
  {/if}

  {@render trailing()}
</a>

{#snippet side({ type }: { type: "leading" | "trailing" })}
  {#if type === "leading" ? img : imgRight}
    <img
      class="q-chip__img q-chip__img--{type}"
      class:responsive
      src={type === "leading" ? img : imgRight}
      alt="{content || 'Slotted'} chip"
    />
  {:else if type === "leading" ? icon : iconRight}
    <Icon class="q-chip__icon" name={type === "leading" ? icon : iconRight} />
  {/if}
{/snippet}

{#snippet leadingFallback()}
  {@render side({ type: "leading" })}
{/snippet}

{#snippet trailingFallback()}
  {@render side({ type: "trailing" })}
{/snippet}

<style lang="scss">
  @import "./chip.scss";
</style>
