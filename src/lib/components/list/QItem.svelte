<script lang="ts">
  import { getRouterInfo, isRouteActive } from "$lib/utils/router";
  import { ripple } from "$lib/helpers/ripple";
  import QSeparator from "../separator/QSeparator.svelte";
  import type { QItemProps, QListProps } from "./props";
  import { QContext } from "$lib/classes/QContext.svelte";

  let {
    tag = "div",
    active = false,
    clickable = false,
    dense = false,
    tabindex = 0,
    href,
    to,
    disabled = false,
    activeClass = "active",
    replace = false,
    noRipple = false,
    children,
    ...props
  }: QItemProps = $props();

  const routerInfo = $derived(
    getRouterInfo({
      href,
      to,
      disabled,
      activeClass,
      replace,
    })
  );

  const multiline = new QContext(false).set("multiline");

  const separatorOptions = QContext.get<QListProps["separatorOptions"] | undefined>("separator");

  const isActionable = $derived(clickable || routerInfo.hasLink || tag === "label");
  const isClickable = $derived(isActionable && !disabled);

  Q.classes("q-item", {
    bemClasses: {
      multiline: multiline.value,
      dense,
      [activeClass]: $isRouteActive(to || href) || (routerInfo.hasLink && active),
    },
    classes: [routerInfo.linkClasses, props.class],
  });
</script>

{#if separatorOptions.value}
  <QSeparator {...separatorOptions.value} />
{/if}

{#if routerInfo.linkAttributes.href}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <a
    use:ripple={{ disabled: !isClickable || noRipple }}
    {...props}
    class="q-item"
    {...Q.classes}
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    {...routerInfo.linkAttributes}
  >
    {@render children?.()}
  </a>
{:else}
  <svelte:element
    this={tag}
    {...props}
    class="q-item"
    {...Q.classes}
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
  >
    {@render children?.()}
  </svelte:element>
{/if}

<style lang="scss">
  @import "./QItem.scss";
</style>
