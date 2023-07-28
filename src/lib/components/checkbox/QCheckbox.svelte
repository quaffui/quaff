<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import type { QCheckboxProps } from "./props";

  export let value: QCheckboxProps["value"] = false,
    label: QCheckboxProps["label"] = "",
    disable: QCheckboxProps["disable"] = false,
    userClasses: QCheckboxProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses([disable && "disabled"], {
    component: "q-checkbox",
    userClasses,
  });
</script>

<label class={classes} {...$$restProps}>
  <input type="checkbox" bind:checked={value} disabled={disable} />
  <span>{label}</span>
</label>
