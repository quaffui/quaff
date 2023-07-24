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
    !unelevated && !flat && "q-btn--elevate",
    rectangle && "q-btn--rectangle",
    outline && "q-btn--outline",
    flat && "q-btn--flat",
    !$$slots.default && !label && "q-btn--round",
    size && `q-btn--${size}`,
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
        <a class="q-btn__loader" />
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
      <a class="q-btn__loader" />
    {/if}

    {#if label}
      <span>{label}</span>
    {/if}
    <slot />
  </button>
{/if}

<style lang="scss">
  @import "$css/mixins.scss";

  .q-btn {
    &--elevate {
      box-shadow: var(--elevate1) !important;
    }

    &--rectangle {
      border-radius: 0.5rem !important;
    }

    &--outline {
      border: 0.0625rem solid var(--primary);
      color: var(--primary);
      box-sizing: border-box;
      background-color: transparent;
      box-shadow: none;
    }

    &--flat {
      background-color: transparent !important;
      box-shadow: none !important;
      color: inherit !important;
    }

    &--round {
      border-radius: 2.5rem;
    }

    &--sm {
      height: 2rem;
      min-width: 2rem;
      font-size: 0.875rem;
      border-radius: 1rem;
    }

    &--lg {
      height: 3rem;
      min-width: 3rem;
      border-radius: 1.5rem;
    }

    &--xl {
      height: 3.5rem;
      min-width: 3.5rem;
      font-size: 1rem;
      border-radius: 1.75rem;
    }

    &__loader {
      @include loader("small", "white");
    }
  }
</style>
