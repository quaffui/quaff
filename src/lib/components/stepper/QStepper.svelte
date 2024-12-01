<script lang="ts">
  import { setContext, untrack, type Snippet } from "svelte";
  import QStepHeader from "./QStepHeader.svelte";
  import { stepperKey, stepsPropsKey, type QStepperProps, type QStepProps } from "./props";

  let {
    value = $bindable(),
    infinite = false,
    vertical = false,
    // transitionPrev,
    // transitionNext,
    // transitionDuration = 300,
    flat = false,
    bordered = false,
    alternativeLabels = false,
    headerNav = false,
    contracted = false,
    headerClass,
    inactiveColor,
    inactiveIcon,
    doneIcon,
    doneColor,
    activeIcon,
    activeColor,
    errorIcon,
    errorColor,
    children,
    navigation,
    message,
    ...props
  }: QStepperProps = $props();

  let stepperEl = $state<HTMLDivElement>();

  const stepper = $derived({
    goTo,
    stepperContent,
    value,
    vertical,
    headerNav,
    inactiveIcon,
    activeIcon,
    errorIcon,
    doneIcon,
    errorColor,
    activeColor,
    doneColor,
    inactiveColor,
    tabindex: props.tabindex,
  });

  const axis = vertical ? "vertical" : "horizontal";

  const altLabel = $derived(
    `q-stepper__header--${alternativeLabels ? "alternative" : "standard"}-labels`
  );

  let stepsProps = $state<QStepProps[]>([]);

  setContext(stepperKey, () => stepper);
  setContext(stepsPropsKey, (stepProps: QStepProps) => untrack(() => handleStepProps(stepProps)));

  function handleStepProps(stepProps: QStepProps) {
    const index = stepsProps.findIndex((step) => step.name === stepProps.name);
    if (index === -1) {
      return stepsProps.push(stepProps);
    }

    stepsProps[index] = stepProps;
  }

  function moveSteps(direction: "next" | "prev", fromIndex?: number) {
    const dir = direction === "next" ? 1 : -1;
    const steps = stepperEl?.querySelectorAll(".q-stepper__tab");

    if (!steps || !steps.length) {
      return;
    }

    const activeStep = Array.from(steps).find((step) =>
      step.classList.contains("q-stepper__tab--active")
    );

    if (!activeStep) {
      return;
    }

    const index = Array.from(steps).indexOf(activeStep);

    if (index === -1) {
      return;
    }

    const indexStart = (fromIndex || index) + dir;
    for (let i = indexStart; i >= 0 && i < steps.length; i += dir) {
      if (!stepsProps[i].disabled) {
        value = stepsProps[i].name;
        return;
      }
    }

    if (index === (dir === 1 ? steps.length - 1 : 0)) {
      if (infinite) {
        moveSteps(direction, index === 0 ? steps.length : -1);
      }
    }
  }

  export function goTo(name: string) {
    value = name;
  }

  export function next() {
    moveSteps("next");
  }

  export function previous() {
    moveSteps("prev");
  }

  Q.classes("q-stepper", {
    bemClasses: {
      [axis]: true,
      flat,
      bordered,
    },
  });

  Q.classes("q-stepper__header", {
    bemClasses: {
      border: bordered || !flat,
      contracted,
    },
    classes: [headerClass, altLabel],
  });
</script>

{#snippet stepperContent(contentChildren?: Snippet)}
  <div class="q-stepper__content{!vertical ? ' q-panel-parent' : ''}">
    {@render contentChildren?.()}
  </div>
{/snippet}

<div bind:this={stepperEl} class="q-stepper" {...Q.classes} data-quaff>
  {#if vertical}
    {@render message?.()}
    {@render stepperContent(children)}
  {:else}
    <div class="q-stepper__header" {...Q.classes}>
      {#each stepsProps as stepProps}
        <QStepHeader stepper={() => stepper} step={stepProps} />
      {/each}
    </div>
    {@render message?.()}
    {@render children?.()}
  {/if}
  {@render navigation?.()}
</div>
