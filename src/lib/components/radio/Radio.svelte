<script lang="ts">
  import type { RadioProps } from "./props";

  let {
    value = "",
    label = "",
    selected = $bindable(),
    disabled = false,
    children,
    ...props
  }: RadioProps = $props();
</script>

<label {...props} class="q-radio {props.class}" class:disabled>
  <input type="radio" bind:group={selected} {value} {disabled} />

  {#if label}
    <span>{label}</span>
  {:else}
    {@render children?.()}
  {/if}
</label>
