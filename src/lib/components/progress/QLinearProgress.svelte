<script lang="ts">
  export let value: number = 0;
</script>

<div class="small-space border" {...$$restProps}>
  <div
    class="progress left"
    style={`clip-path: polygon(0% 0%, 0% 100%, ${value}% 100%, ${value}% 0%);`}
  />
</div>
