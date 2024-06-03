<!-- This component should be used when an icon can be set from props. The icon can either be undefined, a string or a Snippet so this componnet handles it all. -->
<script lang="ts">
  import QIcon from "$components/icon/QIcon.svelte";
  import type { QIconProps } from "$components/icon/props";
  import type { Snippet } from "svelte";
  import type { MaterialSymbol } from "material-symbols";

  interface IconSnippetProps extends Omit<QIconProps, "name"> {
    icon?: MaterialSymbol | Snippet;
    defaultIcon?: MaterialSymbol | Snippet;
  }

  let { icon, defaultIcon, ...props }: IconSnippetProps = $props();

  const iconToUse = $derived(icon ?? defaultIcon);
</script>

{#if typeof iconToUse === "string"}
  <QIcon name={iconToUse} {...props} />
{:else}
  {@render iconToUse?.()}
{/if}
