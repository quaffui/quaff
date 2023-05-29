<script lang="ts">
  export let value: boolean = false;
  export let label: string = '';
</script>

<label class="checkbox">
  <input type="checkbox" checked={value}>
  <span>{label}</span>
</label>
