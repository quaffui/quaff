<script lang="ts" generics="T extends string[]">
  import { setContext, type Snippet } from "svelte";
  import { isSvelteSnippet } from "$utils";
  import QStepHeader from "./QStepHeader.svelte";
  import { qStepPropsDefault, stepperKey, type QStepperProps, type QStepProps } from "./props";
  import QContext from "$lib/classes/QContext.svelte";
  import QStep from "./QStep.svelte";

  let {
    value = $bindable(),
    steps,
    infinite = false,
    swipeable = false,
    vertical = false,
    transitionPrev,
    transitionNext,
    transitionDuration = 300,
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
    stepsProps = qStepPropsDefault,
    children,
    navigation,
    message,
    ...props
  }: QStepperProps<T> = $props();

  const stepper = $derived({
    goToPanel,
    value,
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

  const altLabel = $derived(`${alternativeLabels ? "alternative" : "standard"}-labels`);

  function goToPanel(name: string) {
    value = name;
  }

  setContext(stepperKey, () => stepper);

  Q.classes("q-stepper", {
    bemClasses: {
      [axis]: true,
      flat,
      bordered,
    },
  });

  Q.classes("q-stepper__header", {
    bemClasses: {
      [altLabel]: alternativeLabels,
      border: bordered || !flat,
      contracted,
    },
    classes: [headerClass],
  });
</script>

<div class="q-stepper" {...Q.classes} data-quaff>
  {@render navigation?.()}
  {#if vertical}
    {@render message?.()}
    <div class="q-stepper__content">
      {@render children?.()}
    </div>
  {:else}
    <div class="q-stepper__header" {...Q.classes}>
      {#each steps as step}
        {setContext("QHello", step)}
        {@render props[step as keyof typeof props]?.()}
      {/each}
    </div>
  {/if}
</div>
