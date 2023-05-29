<script lang="ts">
  export let val: string = "";
  export let label: string = "";
  export let selected: any;
</script>

<label class="radio" {...$$restProps}>
  <input type="radio" bind:group={selected} value={val} />
  <span>{label}</span>
</label>
