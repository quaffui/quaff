<script lang="ts">
  import { getRouterInfo, isRouteActive } from "$lib/utils/router";
  import { ripple } from "$lib/helpers/ripple";
  import Separator from "../separator/Separator.svelte";
  import type { ItemProps, ListProps } from "./props";
  import { Context } from "$lib/stores/ref.svelte";

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
  }: ItemProps = $props();

  const routerInfo = $derived(
    getRouterInfo({
      href,
      to,
      disabled,
      activeClass,
      replace,
    })
  );

  const multiline = new Context(false).set("multiline");

  const separatorOptions = Context.get<ListProps["separatorOptions"] | undefined>("separator");

  const isActionable = $derived(clickable || routerInfo.hasLink || tag === "label");
  const isClickable = $derived(isActionable && !disabled);

  Quaff.classes("q-item", {
    bemClasses: {
      multiline: multiline.value,
      dense,
      [activeClass]: $isRouteActive(to || href) || (routerInfo.hasLink && active),
    },
    classes: [routerInfo.linkClasses, props.class],
  });
</script>

{#if separatorOptions.value}
  <Separator {...separatorOptions.value} />
{/if}

{#if routerInfo.linkAttributes.href}
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <a
    use:ripple={{ disabled: !isClickable || noRipple }}
    {...props}
    class="q-item"
    {...Quaff.classes}
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
    {...Quaff.classes}
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
  >
    {@render children?.()}
  </svelte:element>
{/if}

<style lang="scss">
  @import "./item.scss";
</style>
