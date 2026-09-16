<!-- Renders icons, image sources, or snippets supplied through component props. -->
<script lang="ts">
  import QIcon from "$components/icon/QIcon.svelte";
  import type { QIconProps } from "$components/icon/props";
  import { extractImgSrc } from "$utils/string";
  import type { MaterialSymbol } from "material-symbols";
  import type { Snippet } from "svelte";

  interface IconSnippetProps extends Omit<QIconProps, "name"> {
    icon?: MaterialSymbol | Snippet | `img:${string}`;
    defaultIcon?: MaterialSymbol | Snippet | `img:${string}`;
    image?: Snippet<[src: string]>;
  }

  let { icon, defaultIcon, image, ...props }: IconSnippetProps = $props();

  const iconToUse = $derived(icon ?? defaultIcon);
  const src = $derived(typeof iconToUse === "string" ? extractImgSrc(iconToUse) : undefined);
</script>

{#if src && image}
  {@render image(src)}
{:else if typeof iconToUse === "string"}
  <QIcon name={src ? undefined : (iconToUse as MaterialSymbol)} img={src} {...props} />
{:else}
  {@render iconToUse?.()}
{/if}
