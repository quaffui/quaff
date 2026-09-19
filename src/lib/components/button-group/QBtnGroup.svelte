<script module lang="ts">
  import { QContext } from "$utils/context";
  import type { QBtnSizeOptions } from "$components/button/props";

  interface ButtonGroupContext {
    readonly isExpressive: boolean;
    readonly size: QBtnSizeOptions;
    readonly shape: "round" | "squared";
    readonly disabled: boolean;
  }

  export const buttonGroupCtx = QContext<ButtonGroupContext>("QBtnGroup");
</script>

<script lang="ts">
  import { quaffConfig } from "$internal/quaffConfig";
  import { buttonGroupPress } from "$internal/buttonGroupPress";
  import type { QBtnGroupProps } from "./props";

  let {
    connected = false,
    expressive,
    size,
    shape = "round",
    spread,
    disabled = false,
    children,
    ...props
  }: QBtnGroupProps = $props();

  const isExpressive = $derived(expressive ?? quaffConfig.expressive);
  const isConnected = $derived(connected || !isExpressive);
  const resolvedSize = $derived(isExpressive ? (size ?? "sm") : "md");
  const isSpread = $derived(spread ?? (isExpressive && isConnected));

  buttonGroupCtx.set({
    isExpressive,
    size: resolvedSize,
    shape,
    disabled,
  });

  Q.classes("q-btn-group", {
    bemClasses: {
      expressive: isExpressive,
      connected: isConnected,
      squared: shape === "squared",
      spread: isSpread,
      [resolvedSize]: true,
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-btn-group"
  role={props.role ?? "group"}
  {@attach isExpressive && !isConnected ? buttonGroupPress : undefined}
  data-quaff
>
  {@render children?.()}
</div>
