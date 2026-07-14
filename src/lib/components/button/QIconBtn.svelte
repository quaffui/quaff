<script lang="ts">
  import QBtn from "./QBtn.svelte";
  import type { QIconBtnProps } from "./props";

  let { width = "default", expressive = false, icon, children, ...props }: QIconBtnProps = $props();

  const resolvedIcon = $derived(icon ?? children);

  Q.classes("q-icon-btn", {
    bemClasses: {
      [width]: expressive,
    },
    classes: [props.class],
  });
</script>

<QBtn {...props} {expressive} icon={resolvedIcon} class="q-icon-btn" />
