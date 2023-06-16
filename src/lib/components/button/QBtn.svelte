<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import type { QBtnProps } from "./props";

  export let icon: QBtnProps["icon"] = undefined,
    label: QBtnProps["label"] = undefined,
    disable: QBtnProps["disable"] = false,
    loading: QBtnProps["loading"] = false,
    unelevated: QBtnProps["unelevated"] = false,
    outline: QBtnProps["outline"] = false,
    round: QBtnProps["round"] = true,
    flat: QBtnProps["flat"] = false,
    to: QBtnProps["to"] = undefined,
    userClasses: QBtnProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses([
    "q-btn",
    !unelevated && !flat && "small-elevate",
    !round && "small-round",
    outline && "border",
    flat && "transparent",
    !$$slots.default && !label && "circle",
    userClasses,
  ]);

  function openLink() {}
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
