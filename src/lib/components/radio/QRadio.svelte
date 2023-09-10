<script lang="ts">
  import type { QRadioProps } from "./props";

  export let value: QRadioProps["value"] = "",
    label: QRadioProps["label"] = "",
    selected: QRadioProps["selected"] = undefined,
    disable: QRadioProps["disable"] = false,
    userClasses: QRadioProps["userClasses"] = "";
  export { userClasses as class };
</script>

<label class="q-radio {userClasses}" class:q-radio--disabled={disable} {...$$restProps}>
  <input type="radio" bind:group={selected} {value} disabled={disable} />
  <span>{label}</span>
</label>
