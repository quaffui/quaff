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

  let { icon, defaultIcon, children, ...props }: IconSnippetProps = $props();
</script>

{#if icon}
  {#if typeof icon === "string"}
    <QIcon name={icon} {...props} />
  {:else}
    {@render icon()}
  {/if}
{:else if defaultIcon}
  {#if typeof defaultIcon === "string"}
    <QIcon name={defaultIcon} {...props} />
  {:else}
    {@render defaultIcon()}
  {/if}
{/if}
