<script lang="ts">
  let focus = false;
  $: active = value || focus;

  let slotPrependWidth = 0;

  import type { QInputProps } from "../input/props";

  export let dense: QInputProps["dense"] = false,
    disable: QInputProps["disable"] = false,
    error: QInputProps["error"] = false,
    errorMessage: QInputProps["errorMessage"] = undefined,
    filled: QInputProps["filled"] = false,
    hint: QInputProps["hint"] = undefined,
    label: QInputProps["label"] = undefined,
    outlined: QInputProps["outlined"] = false,
    rounded: QInputProps["rounded"] = false,
    value: QInputProps["value"],
    userClasses: QInputProps["userClasses"] = "";

  export { userClasses as class };
</script>

<div
  class="q-input q-field {userClasses}"
  class:q-field--default={!outlined && !rounded && !filled}
  class:q-field--outlined={outlined}
  class:q-field--rounded={rounded}
  class:q-field--filled={filled}
  class:q-field--has-border={outlined || rounded}
  class:q-field--dense={dense}
  class:q-field--active={active}
  class:q-field--focus={focus}
  class:q-field--label={label}
  class:q-field--slot-append={$$slots.append}
  class:q-field--slot-prepend={$$slots.prepend}
  class:q-field--disable={disable}
  class:q-field--error={error}
  style="--slot-prepend-width: {slotPrependWidth}px"
  {...$$restProps}
>
  {#if $$slots.before}
    <div class="q-field__slot-before">
      <slot name="before" />
    </div>
  {/if}

  <div class="q-field__inner">
    <label class="q-field__wrapper">
      {#if $$slots.prepend}
        <div class="q-field__slot-prepend" bind:clientWidth={slotPrependWidth}>
          <slot name="prepend" />
        </div>
      {/if}
      <input
        class="q-field__input"
        bind:value
        placeholder=""
        on:focus={() => (focus = true)}
        on:blur={() => (focus = false)}
        disabled={disable}
        tabindex={disable === true ? -1 : 0}
      />
      <span class="q-field__label">{label}</span>

      {#if $$slots.append}
        <div class="q-field__slot-append">
          <slot name="append" />
        </div>
      {/if}
    </label>

    {#if error && errorMessage}
      <div class="q-field__error">{errorMessage}</div>
    {:else if hint}
      <div class="q-field__hint">{hint}</div>
    {/if}
  </div>

  {#if $$slots.after}
    <div class="q-field__slot-after">
      <slot name="after" />
    </div>
  {/if}
</div>
