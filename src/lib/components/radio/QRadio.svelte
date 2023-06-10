<script lang="ts">
  import type { QRadioProps } from "./props";

  export let value: QRadioProps["value"] = "",
    label: QRadioProps["label"] = "",
    selected: QRadioProps["selected"],
    userClasses: QRadioProps["userClasses"] = "";
  export { userClasses as class };
</script>

<label class={`radio ${userClasses}`} {...$$restProps}>
  <input type="radio" bind:group={selected} {value} />
  <span>{label}</span>
</label>
