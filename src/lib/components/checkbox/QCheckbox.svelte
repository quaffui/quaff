<script lang="ts">
  export let value: boolean = false;
  export let label: string = "";
</script>

<label class="checkbox" {...$$restProps}>
  <input type="checkbox" bind:checked={value} />
  <span>{label}</span>
</label>
