<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QTooltip from "$components/tooltip/QTooltip.svelte";
  import type { QExtendedFabProps } from "$components/fab/props";
  import { buttonGroupCtx } from "$components/button-group/QBtnGroup.svelte";
  import { quaffConfig } from "$internal/quaffConfig";

  interface Props extends Omit<QExtendedFabProps, "label"> {
    label?: string;
    hasTooltip?: boolean;
  }

  let {
    label,
    icon,
    collapsed = false,
    hasTooltip = true,
    expressive,
    size,
    color = "primary-container",
    type = "button",
    ...props
  }: Props = $props();

  buttonGroupCtx.reset();

  let triggerEl = $state<HTMLElement>();
  const isExpressive = $derived(expressive ?? quaffConfig.expressive);
  const resolvedSize = $derived(size ?? (isExpressive ? "sm" : "md"));
  const isExtended = $derived(label !== undefined);
  const isCollapsed = $derived(isExtended && collapsed && icon !== undefined);
  const accessibleName = $derived(props["aria-label"] ?? label);
  const canShowTooltip = $derived(hasTooltip && (!isExtended || isCollapsed));

  function captureTrigger(element: HTMLElement) {
    triggerEl = element;

    return () => {
      triggerEl = undefined;
    };
  }

  Q.classes("q-fab", {
    bemClasses: {
      [resolvedSize]: true,
      [color]: true,
      expressive: isExpressive,
      extended: isExtended,
      collapsed: isCollapsed,
      "with-icon": icon !== undefined,
    },
    classes: [isExtended && "q-extended-fab", props.class],
  });
</script>

<QBtn
  {...props}
  {type}
  {icon}
  expressive={false}
  variant="filled"
  aria-label={accessibleName}
  class="q-fab"
  {@attach captureTrigger}
>
  <span class="q-fab__label">{label}</span>
</QBtn>

{#if canShowTooltip && accessibleName}
  <QTooltip target={triggerEl}>{accessibleName}</QTooltip>
{/if}
