<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import { buttonGroupCtx } from "$components/button-group/QBtnGroup.svelte";
  import { createMenuTrigger } from "$internal/menuTrigger.svelte";
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
  const menu = createMenuTrigger(
    `${id}-menu`,
    () => expanded,
    (isOpen) => (expanded = isOpen),
    () => dir,
    () => disabled
  );
  // #endregion: --- Variables

  // #region:    --- Context
  buttonGroupCtx.reset();
  // #endregion: --- Context

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
    aria-expanded={menu.isExpanded}
    aria-controls={menu.isExpanded ? menu.id : undefined}
    onclick={menu.toggleMenu}
    onkeydown={menu.handleTriggerKeydown}
    {@attach menu.captureTrigger}
  >
    <QIcon name="keyboard_arrow_down" class="q-btn__icon" aria-hidden="true" />
  </QIconBtn>
  <QMenu
    id={menu.id}
    bind:value={() => menu.isExpanded, menu.setExpanded}
    target={menu.triggerEl}
    dir={menu.direction}
    anchor={menu.isRtl ? "bottom right" : "bottom left"}
    self={menu.isRtl ? "top right" : "top left"}
    offset={{ y: 4 }}
    flip
    expressive
    aria-labelledby={`${id}-trigger`}
    onkeydown={menu.handleMenuKeydown}
    {@attach menu.focusMenu}
  >
    {@render children()}
  </QMenu>
</div>
