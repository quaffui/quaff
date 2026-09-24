<!--
@component
Open a menu of related actions from a floating action button.
-->

<script lang="ts">
  import QMenu from "$components/menu/QMenu.svelte";
  import QFabBase from "$internal/QFabBase.svelte";
  import { createMenuTrigger } from "$internal/menuTrigger.svelte";
  import type { QFabMenuProps } from "./props";

  let {
    expanded = $bindable(false),
    menuLabel,
    children,
    onkeydown,
    ...props
  }: QFabMenuProps = $props();

  const id = $props.id();
  const triggerId = $derived(props.id ?? `${id}-trigger`);
  const menu = createMenuTrigger(
    `${id}-menu`,
    () => expanded,
    (isOpen) => (expanded = isOpen),
    () => props.dir
  );
</script>

<QFabBase
  {...props}
  id={triggerId}
  type="button"
  hasTooltip={!menu.isExpanded}
  aria-label={menuLabel}
  aria-haspopup="menu"
  aria-expanded={menu.isExpanded}
  aria-controls={menu.isExpanded ? menu.id : undefined}
  onclick={menu.toggleMenu}
  onkeydown={(event) => {
    onkeydown?.(event);
    menu.handleTriggerKeydown(event);
  }}
  {@attach menu.captureTrigger}
/>
<QMenu
  id={menu.id}
  bind:value={() => menu.isExpanded, menu.setExpanded}
  target={menu.triggerEl}
  dir={menu.direction}
  anchor={menu.isRtl ? "top left" : "top right"}
  self={menu.isRtl ? "bottom left" : "bottom right"}
  offset={{ y: -4 }}
  flip
  expressive={false}
  aria-labelledby={triggerId}
  onkeydown={menu.handleMenuKeydown}
  {@attach menu.focusMenu}
>
  {@render children()}
</QMenu>
