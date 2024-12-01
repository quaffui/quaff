<script lang="ts">
  import { getContext, hasContext } from "svelte";
  import type { QEvent } from "$utils";
  import QStepHeader from "./QStepHeader.svelte";
  import { stepperKey, stepsPropsKey, type QStepperContext, type QStepProps } from "./props";

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

  if (!hasContext(stepperKey) || !hasContext(stepsPropsKey)) {
    throw new Error("QStep must be used inside QStepper");
  }

  const stepper = getContext<() => QStepperContext>(stepperKey);
  const addPropsForStepper = getContext<(stepProps: QStepProps) => void>(stepsPropsKey);

  $effect(() => {
    addPropsForStepper?.(step);
  });

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

{#snippet stepContent()}
  {#if !stepper().vertical || isActive}
    <div class="q-stepper__step-content">
      <div class="q-stepper__step-inner">
        {@render children?.()}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet panel()}
  <div class="q-panel">
    <div class="q-stepper__step" role="tabpanel" onscroll={onScrollFunction}>
      {@render stepContent()}
    </div>
  </div>
{/snippet}

{#if stepper().vertical}
  <div class="q-stepper__step" role="tabpanel" onscroll={onScrollFunction}>
    <QStepHeader {step} {stepper} />
    {@render stepContent()}
  </div>
{:else if isActive}
  {@render stepper().stepperContent(panel)}
{/if}
