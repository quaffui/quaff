<script lang="ts">
  import { QAvatar, QIcon } from "$lib";
  import { ripple } from "$helpers";
  import { extractImgSrc, isActivationKey, setupTooltipContext, type QEvent } from "$utils";
  import type { MaterialSymbol } from "material-symbols";
  import type { QChipProps } from "./props";

  type QChipMouseEvent = QEvent<MouseEvent, HTMLElement>;

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
    onTrailingIconClick,
    children,
    ...props
  }: QChipProps = $props();

  const uid = $props.id();
  const componentId = `q-chip--${uid}`;

  setupTooltipContext(componentId);

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
  const role = $derived(["assist", "filter"].includes(kind) ? "button" : undefined);

  const avatar = $derived(extractImgSrc(icon));

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

  Q.classes("q-chip", {
    bemClasses: {
      [kind]: true,
      [size]: true,
      selected,
      elevated,
      outlined: !elevated,
      [componentId]: true,
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
