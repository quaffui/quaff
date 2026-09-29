<script lang="ts">
  let { id, message, error = false }: { id: string; message?: string; error?: boolean } = $props();
</script>

<!-- Keep the live region mounted so later validation errors can be announced. -->
<div
  {id}
  class:q-field__error={!!message && error}
  class:q-field__hint={!!message && !error}
  aria-live="polite"
  aria-atomic="true"
>
  {message ?? ""}
</div>
