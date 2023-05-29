<script lang="ts">
  export let val: string = "",
    label: string = "",
    selected: any,
    className: string | undefined;

  export {className as class};
</script>

<label class={`radio ${className}`} {...$$restProps}>
  <input type="radio" bind:group={selected} value={val} />
  <span>{label}</span>
</label>
