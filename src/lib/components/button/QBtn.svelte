<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import type { QBtnProps } from "./props";

  export let icon: QBtnProps["icon"] = undefined,
    label: QBtnProps["label"] = undefined,
    disable: QBtnProps["disable"] = false,
    loading: QBtnProps["loading"] = false,
    unelevated: QBtnProps["unelevated"] = false,
    outline: QBtnProps["outline"] = false,
    rectangle: QBtnProps["rectangle"] = false,
    flat: QBtnProps["flat"] = false,
    to: QBtnProps["to"] = undefined,
    size: QBtnProps["size"] = undefined,
    userClasses: QBtnProps["userClasses"] = undefined;
  export { userClasses as class };

  const sizeMap = {
    sm: "small",
    lg: "large",
    xl: "extra",
  };

  $: classes = createClasses([
    "q-btn",
    !unelevated && !flat && "small-elevate",
    rectangle && "small-round",
    outline && "border",
    flat && "transparent",
    !$$slots.default && !label && "circle",
    size && size !== "md" ? sizeMap[size] : null,
    userClasses,
  ]);
</script>

{#if to !== undefined}
  <a href={to}>
    <button class={classes} {...$$restProps} disabled={disable} on:click>
      {#if icon && !loading}
        <i>{icon}</i>
      {/if}

      {#if loading}
        <a class="loader small white" />
      {/if}

      {#if label}
        <span>{label}</span>
      {/if}
      <slot />
    </button>
  </a>
{:else}
  <button class={classes} {...$$restProps} disabled={disable} on:click>
    {#if icon && !loading}
      <i>{icon}</i>
    {/if}

    {#if loading}
      <a class="loader small white" />
    {/if}

    {#if label}
      <span>{label}</span>
    {/if}
    <slot />
  </button>
{/if}
