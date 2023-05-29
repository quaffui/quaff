<script lang="ts">
  export let value: boolean = false,
    label: string = "",
    className: string | undefined;

  export {className as class};
</script>

<label class="{`checkbox ${className}`}" {...$$restProps}>
  <input type="checkbox" bind:checked={value} />
  <span>{label}</span>
</label>
