<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { QListProps } from "./props";

  export let bordered: QListProps["bordered"] = false,
    roundedBorders: QListProps["roundedBorders"] = false,
    dense: QListProps["dense"] = false,
    separator: QListProps["separator"] = false,
    separatorOptions: QListProps["separatorOptions"] = {},
    padding: QListProps["padding"] = false,
    tag: QListProps["tag"] = "div",
    userClasses: QListProps["userClasses"] = "";
  export { userClasses as class };

  let listElement: HTMLElement;

  onMount(() => listElement.querySelector(".q-separator__wrapper:first-child")?.remove());

  $: setContext("separator", separator === true ? separatorOptions : undefined);
</script>

<svelte:element
  this={tag}
  class="q-list {userClasses}"
  class:q-list--bordered={bordered}
  class:q-list--rounded={roundedBorders}
  class:q-list--dense={dense}
  class:q-py-sm={padding}
  {...$$restProps}
  bind:this={listElement}
  on:scroll
>
  <slot />
</svelte:element>
