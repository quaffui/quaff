<script lang="ts">
  import { stringifyClasses } from "$lib/utils/props";
  import { type QBtnProps } from "./props";

  export let icon: QBtnProps["icon"] = undefined,
    label: QBtnProps["label"] = undefined,
    disable: QBtnProps["disable"] = undefined,
    loading: QBtnProps["loading"] = undefined,
    unelevated: QBtnProps["unelevated"] = undefined,
    outline: QBtnProps["outline"] = undefined,
    round: QBtnProps["round"] = undefined,
    userClasses: QBtnProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = stringifyClasses([
    "q-btn",
    !unelevated && "small-elevate",
    !round && "small-round",
    outline && "border",
    userClasses,
  ]);
</script>

<button class={classes} {...$$restProps} disabled={disable}>
  {#if icon && !loading}
    <i>{icon}</i>
  {/if}

  {#if loading}
    <a class="loader small white" />
  {/if}

  <slot>
    <span>{label}</span>
  </slot>
</button>
