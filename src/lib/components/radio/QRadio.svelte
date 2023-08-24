<script lang="ts">
  import { createClasses } from "$lib/utils";
  import type { QRadioProps } from "./props";

  export let value: QRadioProps["value"] = "",
    label: QRadioProps["label"] = "",
    selected: QRadioProps["selected"] = undefined,
    disable: QRadioProps["disable"] = false,
    userClasses: QRadioProps["userClasses"] = "";
  export { userClasses as class };

  $: classes = createClasses([disable && "disabled"], {
    component: "q-radio",
    userClasses,
  });
</script>

<label class={classes} {...$$restProps}>
  <input type="radio" bind:group={selected} {value} disabled={disable} />
  <span>{label}</span>
</label>
