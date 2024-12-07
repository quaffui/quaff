<script lang="ts">
  const { children } = $props();
</script>

<div class="q-stepper__nav">
  {@render children?.()}
</div>
