<script lang="ts">
  import QIcon from "$components/icon/QIcon.svelte";
  import { ripple } from "$helpers";
  import type { QStepHeaderProps } from "./props";

  const defaultIcons = {
    active: "edit",
    done: "check",
    error: "error",
  } as const;

  let stepEl = $state<HTMLDivElement>();

  const { stepper, step }: QStepHeaderProps = $props();

  const active = $derived(stepper().value === step.name);

  const done = $derived(!step.disabled && step.done);

  const headerNav = $derived(!step.disabled && stepper().headerNav && step.headerNav);

  const hasPrefix = $derived(
    step.prefix &&
      (!active || !step.activeIcon) &&
      (!done || !step.doneIcon) &&
      (!step.error || !step.errorIcon)
  );

  const icon = $derived.by(() => {
    const defaultIcon = step.icon || stepper().inactiveIcon;

    if (active) {
      const icon = step.activeIcon || stepper().activeIcon;
      return icon === "none" ? defaultIcon : icon || defaultIcons.active;
    }

    if (step.error) {
      const icon = step.errorIcon || stepper().errorIcon;
      return icon === "none" ? defaultIcon : icon || defaultIcons.error;
    }

    if (!step.disabled && step.done) {
      const icon = step.doneIcon || stepper().doneIcon;
      return icon === "none" ? defaultIcon : icon || defaultIcons.done;
    }

    return defaultIcon;
  });

  const color = $derived.by(() => {
    const errorColor = step.error ? step.errorColor : stepper().errorColor;

    if (active) {
      const color = step.activeColor || stepper().activeColor || step.color;
      return color || errorColor;
    }

    if (errorColor) {
      return errorColor;
    }

    if (!step.disabled && step.done) {
      return step.doneColor || stepper().doneColor || step.color || stepper().inactiveColor;
    }

    return step.color || stepper().inactiveColor;
  });

  function onActivate() {
    if (!headerNav || !stepEl) {
      return;
    }

    stepEl.focus();
    if (!active) {
      stepper().goTo(step.name);
    }
  }

  function onKeyup(e: KeyboardEvent) {
    if (e.code === "Enter") {
      stepEl?.click();
    }
  }

  Q.classes("q-stepper__tab", {
    bemClasses: {
      error: step.error,
      active,
      done,
      navigation: headerNav,
      disabled: step.disabled,
    },
    classes: [
      color && `text-${color}`,
      step.error && `q-stepper__tab--error-with-${hasPrefix ? "prefix" : "icon"}`,
    ],
  });
</script>

<div
  bind:this={stepEl}
  use:ripple={{ disabled: !headerNav }}
  class="q-stepper__tab"
  {...Q.classes}
  role="tab"
  tabindex={step.disabled ? -1 : step.tabindex || stepper().tabindex || 0}
  aria-disabled={step.disabled}
  onclick={!step.disabled ? onActivate : undefined}
  onkeyup={!step.disabled ? onKeyup : undefined}
>
  <div class="q-stepper__dot q-stepper__line">
    <span>
      {#if hasPrefix}
        {step.prefix}
      {:else if icon}
        <QIcon name={icon} style="font-size: 0.875rem" />
      {/if}
    </span>
  </div>
  {#if step.title}
    <div class="q-stepper__label q-stepper__line">
      <div class="q-stepper__title">{step.title}</div>
      {#if step.caption}
        <div class="q-stepper__caption">{step.caption}</div>
      {/if}
    </div>
  {/if}
</div>
