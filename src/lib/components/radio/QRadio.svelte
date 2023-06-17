<script lang="ts">
  import type { QRadioProps } from "./props";

  export let value: QRadioProps["value"] = "",
    label: QRadioProps["label"] = "",
    selected: QRadioProps["selected"],
    disable: QRadioProps["disable"],
    userClasses: QRadioProps["userClasses"] = "";
  export { userClasses as class };
</script>

<label class={`radio ${userClasses}`} {...$$restProps}>
  <input type="radio" bind:group={selected} {value} disabled={disable} />
  <span>{label}</span>
</label>
