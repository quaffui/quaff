<script lang="ts">
  import Icon from "$lib/components/icon/Icon.svelte";
  import type { FieldProps } from "./props";

  let {
    value = $bindable(""),
    type = "text",
    filled = false,
    outlined = false,
    disabled = false,
    label,
    error = false,
    errorMessage,
    hint,
    icon,
    onIconClick,
    iconRight,
    onRightIconClick,
    children,
    ...props
  }: FieldProps = $props();

  let active = $derived(!!value);
  let focused = $state(false);

  const padding = $derived(
    icon && iconRight
      ? "1.75rem 3.25rem 0 3.25rem"
      : icon
        ? "1.75rem 0 0 3.25rem"
        : iconRight
          ? "1.75rem 3.25rem 0 0"
          : "1.75rem 0 0 0"
  );

  Quaff.classes("q-field__outline", {
    bemClasses: {
      focused,
      active,
      icon,
    },
  });
  Quaff.classes("q-field__filled", {
    bemClasses: {
      focused,
      active,
    },
    classes: ["flex", "items-center"],
  });
  Quaff.classes("q-field", {
    bemClasses: {
      outlined,
      filled,
    },
    classes: ["body-large", props.class],
  });
</script>

{#snippet outline()}
  {#if outlined}
    <div class="q-field__outline" {...Quaff.classes}>
      <div class="q-field__outline--leading" />
      <div class="q-field__outline--notch flex flex-center">
        <div class="q-field__label">
          {label}
        </div>
      </div>
      <div class="q-field__outline--trailing" />
    </div>
  {:else}
    <div class="q-field__filled" {...Quaff.classes} style:padding>
      <div class="q-field__label">{label}</div>
    </div>
  {/if}
{/snippet}

<label {...props} class="q-field" {...Quaff.classes}>
  {@render outline()}
  {#if icon}
    <Icon
      name={icon}
      color={focused ? "primary" : "on-secondary-container"}
      style="margin-left: -0.25rem; margin-right: 1rem;"
      onclick={onIconClick}
    />
  {/if}
  <input
    bind:value
    {type}
    class="body-large"
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
  />
  {#if iconRight}
    <Icon
      name={iconRight}
      color={focused ? "primary" : "on-secondary-container"}
      style="margin-right: -0.25rem; margin-left: 1rem;"
      onclick={onRightIconClick}
    />
  {/if}
  {#if !outlined}
    <div class="indicator" />
  {/if}
</label>

<style lang="scss">
  @import "./field.scss";
</style>
