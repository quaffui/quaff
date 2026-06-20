<script lang="ts">
  import QAvatar from "$components/avatar/QAvatar.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import { ripple } from "$helpers";
  import { extractImgSrc, isActivationKey, type QEvent } from "$utils";
  import type { MaterialSymbol } from "material-symbols";
  import type { QChipProps } from "./props";

  type QChipMouseEvent = QEvent<MouseEvent, HTMLElement>;

  // #region:    --- Props
  let {
    kind = "assist",
    selected = $bindable(kind === "filter" ? false : undefined),
    label,
    icon,
    trailingIcon,
    disabled = false,
    elevated,
    noRipple = false,
    size = "sm",
    onTrailingIconClick,
    children,
    ...props
  }: QChipProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let qChip: HTMLDivElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const trailing = $derived(
    (kind === "assist" || kind === "suggestion") && trailingIcon ? undefined : trailingIcon
  );

  const role = $derived(["assist", "filter"].includes(kind) ? "button" : undefined);
  const tabindex = $derived(!role ? undefined : disabled ? -1 : (props.tabindex ?? 0));

  const avatar = $derived(extractImgSrc(icon));
  // #endregion: --- Derived values

  // #region:    --- Effects
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
  // #endregion: --- Effects

  // #region:    --- Functions
  function stopIfDisabled(e: QChipMouseEvent, iconClick = false) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    if (kind === "filter") {
      selected = !selected;
    }

    e.stopPropagation();
    if (iconClick) {
      onTrailingIconClick?.(e);
    } else {
      props.onclick?.(e as QEvent<MouseEvent, HTMLDivElement>);
    }
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
  // #endregion: --- Functions

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

<!-- 
  We can ignore a11y_no_noninteractive_tabindex because the tabindex
  is set programmatically so svelte doesn't know the final value
  at compile time and thus throws the warning.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={qChip}
  {@attach ripple({
    disabled: noRipple || disabled,
    color: elevated ? "on-surface-variant" : undefined,
  })}
  {...props}
  class="q-chip"
  aria-disabled={disabled || undefined}
  {tabindex}
  {role}
  onclick={stopIfDisabled}
  {onkeydown}
  data-quaff
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
    <QIcon class="q-chip__trailing-icon" name={trailing} onclick={(e) => stopIfDisabled(e, true)} />
  {/if}
</div>
