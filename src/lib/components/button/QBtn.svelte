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
  @import "$beercss";

  .q-btn {
    &--elevate {
      @extend .small-elevate;
    }

    &--rectangle {
      @extend .small-round;
    }

    &--outline {
      @extend .border;
    }

    &--flat {
      @extend .transparent;
    }

    &--round {
      @extend .circle;
    }

    &--sm {
      @extend .small;
    }

    &--lg {
      @extend .large;
    }

    &--xl {
      @extend .extra;
    }

    &__loader {
      @extend .loader;
      @extend .small;
      @extend .white;
    }
  }
</style>
