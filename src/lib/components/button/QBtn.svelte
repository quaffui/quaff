<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import type { QBtnProps } from "./props";

  export let icon: QBtnProps["icon"] = undefined,
    label: QBtnProps["label"] = undefined,
    disable: QBtnProps["disable"] = undefined,
    loading: QBtnProps["loading"] = undefined,
    unelevated: QBtnProps["unelevated"] = undefined,
    outline: QBtnProps["outline"] = undefined,
    round: QBtnProps["round"] = undefined,
    flat: QBtnProps["flat"] = undefined,
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
