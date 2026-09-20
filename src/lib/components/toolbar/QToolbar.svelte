<script lang="ts">
  import { toolbarKeyboard } from "./keyboard";
  import type { QToolbarProps } from "./props";

  // #region:    --- Props
  let {
    floating = false,
    vertical = false,
    vibrant = false,
    unelevated = false,
    children,
    ...props
  }: QToolbarProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const isFloating = $derived(floating || vertical);
  // #endregion: --- Derived values

  const keyboard = toolbarKeyboard(() => vertical);

  Q.classes("q-toolbar", {
    bemClasses: { floating: isFloating, vertical, vibrant, unelevated },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-toolbar"
  role="toolbar"
  aria-orientation={vertical ? "vertical" : "horizontal"}
  onkeydown={(event) => {
    props.onkeydown?.(event);
    keyboard.onkeydown(event);
  }}
  onfocusin={(event) => {
    props.onfocusin?.(event);
    keyboard.onfocusin(event);
  }}
  {@attach keyboard.attach}
  data-quaff
>
  {@render children?.()}
</div>
