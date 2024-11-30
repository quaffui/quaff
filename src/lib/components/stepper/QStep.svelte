<script lang="ts">
  import { getContext } from "svelte";
  import QStepHeader from "./QStepHeader.svelte";
  import { stepperKey, type QStepperContext, type QStepProps } from "./props";
  import type { QEvent } from "$utils";

  const {
    name,
    title,
    headerNav = true,
    disabled = false,
    done = false,
    error = false,
    icon,
    color,
    caption,
    prefix,
    doneIcon,
    doneColor,
    activeIcon,
    activeColor,
    errorIcon,
    errorColor,
    children,
    ...props
  }: QStepProps = $props();

  const stepper = getContext<() => QStepperContext>(stepperKey);
  const step = $derived({
    name,
    disabled,
    error,
    done,
    headerNav,
    prefix,
    icon,
    activeIcon,
    errorIcon,
    doneIcon,
    errorColor,
    activeColor,
    color,
    doneColor,
    title,
    caption,
  });

  const ctx = getContext("QHello");

  $inspect(ctx);

  if (!stepper) {
    throw new Error("QStep must be used inside QStepper");
  }

  const isActive = $derived(stepper().value === name);

  const onScrollFunction = $derived(
    isActive && stepper().vertical
      ? (e: QEvent<UIEvent, HTMLDivElement>) => {
          const { target } = e;
          if (target instanceof HTMLElement && target.scrollTop > 0) {
            target.scrollTop = 0;
          }

          props.onscroll?.(e);
        }
      : undefined
  );
</script>

<div class="q-stepper__step" role="tabpanel" onscroll={onScrollFunction}>
  {#if stepper().vertical}
    <QStepHeader {stepper} {step} />
  {:else}
    <div class="q-stepper__step-content">
      <div class="q-stepper__step-inner">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>
