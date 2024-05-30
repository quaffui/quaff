<script lang="ts">
  import { ripple } from "$lib/helpers";
  import { extractImgSrc, isActivationKey } from "$lib/utils";
  import QIcon from "../icon/QIcon.svelte";
  import QAvatar from "../avatar/QAvatar.svelte";
  import type { MaterialSymbol } from "material-symbols";
  import type { QChipProps } from "./props";

  type QChipMouseEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  };

  let {
    kind = "assist",
    label,
    icon,
    trailingIcon,
    disabled = false,
    elevated,
    noRipple = false,
    selected = $bindable(kind === "filter" ? false : undefined),
    size = "sm",
    children,
    ...props
  }: QChipProps = $props();

  let qChip: HTMLDivElement;

  $effect.pre(() => {
    if (selected !== undefined && kind !== "filter") {
      throw new Error('Only QChips of kind "filter" can use the "selected" prop.');
    }

    if ((kind === "assist" || kind === "suggestion") && trailingIcon) {
      console.warn(
        'QChips of kind "assist" and "suggestion" should not have a trailing icon. It will thus be ignored.'
      );
    }
  });

  const trailing = $derived(
    (kind === "assist" || kind === "suggestion") && trailingIcon ? undefined : trailingIcon
  );

  const tabindex = disabled ? -1 : props.tabindex || 0;

  const avatar = extractImgSrc(icon);

  function stopIfDisabled(e: QChipMouseEvent) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    if (kind === "filter") {
      selected = !selected;
    }

    e.stopPropagation();
    props.onclick?.(e);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      qChip?.blur();
      return;
    }

    if (!isActivationKey(e)) {
      return;
    }

    e.preventDefault();

    const click = new MouseEvent("click", { relatedTarget: qChip }) as QChipMouseEvent;
    stopIfDisabled(click);
  }

  Q.classes("q-chip", {
    bemClasses: {
      [kind]: true,
      [size]: true,
      selected,
      elevated,
      outlined: !elevated,
    },
    classes: [props.class],
  });
</script>

<div
  bind:this={qChip}
  use:ripple={{
    disabled: noRipple || disabled,
    color: elevated ? "var(--on-surface-variant)" : undefined,
  }}
  {...props}
  class="q-chip"
  {...Q.classes}
  aria-disabled={disabled || undefined}
  {tabindex}
  onclick={stopIfDisabled}
  {onkeydown}
>
  {#if icon && !selected && !avatar}
    <QIcon class="q-chip__leading-icon" name={icon as MaterialSymbol} />
  {:else if avatar && !selected}
    <QAvatar class="q-chip__avatar" src={avatar} />
  {:else if selected}
    <QIcon class="q-chip__leading-icon" name="check" />
  {/if}

  <div class="q-chip__label">
    {#if label}
      {label}
    {:else}
      {@render children?.()}
    {/if}
  </div>

  {#if trailing}
    <QIcon class="q-chip__trailing-icon" name={trailing} />
  {/if}
</div>

<style lang="scss">
  @import "./QChip.scss";
</style>
