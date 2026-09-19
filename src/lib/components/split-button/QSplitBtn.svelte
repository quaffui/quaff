<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import { buttonGroupCtx } from "$components/button-group/QBtnGroup.svelte";
  import type { QSplitBtnProps } from "./props";

  // #region:    --- Props
  let {
    variant = "filled",
    size = "sm",
    disabled = false,
    expanded = $bindable(false),
    menuLabel,
    children,
    type = "button",
    class: userClass,
    style,
    dir,
    noRipple,
    rippleColor,
    ...props
  }: QSplitBtnProps = $props();
  // #endregion: --- Props

  // #region:    --- Variables
  const id = $props.id();
  let triggerEl = $state<HTMLElement>();
  let resolvedDirection = $state<"ltr" | "rtl">();
  let isLastItemRequested = false;
  const isExpanded = $derived(expanded && !disabled);
  const isRtl = $derived((resolvedDirection ?? dir) === "rtl");
  // #endregion: --- Variables

  // #region:    --- Context
  buttonGroupCtx.reset();
  // #endregion: --- Context

  // #region:    --- Effects
  $effect(() => {
    if (disabled && expanded) {
      expanded = false;
    }

    if (isExpanded && triggerEl) {
      const direction =
        dir === "ltr" || dir === "rtl" ? dir : getComputedStyle(triggerEl).direction;
      resolvedDirection = direction === "rtl" ? "rtl" : "ltr";
    }
  });

  $effect.pre(() => {
    if (isExpanded || disabled) {
      return;
    }

    const menu = document.getElementById(`${id}-menu`);

    if (menu?.contains(document.activeElement)) {
      triggerEl?.focus();
    }
  });

  // #endregion: --- Effects

  // #region:    --- Functions
  function captureTrigger(element: HTMLElement) {
    triggerEl = element;
  }

  function toggleMenu() {
    isLastItemRequested = false;
    expanded = !expanded;
  }

  function handleTriggerKeydown(event: KeyboardEvent) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    isLastItemRequested = event.key === "ArrowUp";
    expanded = true;
  }

  function focusMenu(element: HTMLElement) {
    const frameId = requestAnimationFrame(() => {
      const items = Array.from(
        element.querySelectorAll<HTMLElement>(
          '[role^="menuitem"]:not([aria-disabled="true"], :disabled)'
        )
      ).filter((item) => item.checkVisibility({ visibilityProperty: true }));
      (items.at(isLastItemRequested ? -1 : 0) ?? element).focus();
    });

    return () => {
      cancelAnimationFrame(frameId);
      isLastItemRequested = false;
    };
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || (event.key !== "Escape" && event.key !== "Tab")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
    }

    triggerEl?.focus();
    expanded = false;
  }
  // #endregion: --- Functions

  Q.classes("q-split-btn", {
    bemClasses: { [size]: true },
    classes: [userClass],
  });
</script>

<div class="q-split-btn" {style} {dir} data-quaff>
  <QBtn
    {...props}
    {type}
    {variant}
    {size}
    {disabled}
    {noRipple}
    {rippleColor}
    expressive
    class="q-split-btn__leading"
  />
  <QIconBtn
    id={`${id}-trigger`}
    type="button"
    {variant}
    {size}
    {disabled}
    {noRipple}
    {rippleColor}
    expressive
    class="q-split-btn__trailing"
    aria-label={menuLabel}
    aria-haspopup="menu"
    aria-expanded={isExpanded}
    aria-controls={isExpanded ? `${id}-menu` : undefined}
    onclick={toggleMenu}
    onkeydown={handleTriggerKeydown}
    {@attach captureTrigger}
  >
    <QIcon name="keyboard_arrow_down" class="q-btn__icon" aria-hidden="true" />
  </QIconBtn>
  <QMenu
    id={`${id}-menu`}
    bind:value={() => isExpanded, (isOpen) => (expanded = isOpen)}
    target={triggerEl}
    dir={resolvedDirection ?? dir}
    anchor={isRtl ? "bottom right" : "bottom left"}
    self={isRtl ? "top right" : "top left"}
    offset={{ y: 4 }}
    flip
    expressive
    aria-labelledby={`${id}-trigger`}
    onkeydown={handleMenuKeydown}
    {@attach focusMenu}
  >
    {@render children()}
  </QMenu>
</div>
