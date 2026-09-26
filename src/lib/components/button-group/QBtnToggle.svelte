<!--
@component
Choose one or several values with connected or standard button groups, including baseline segmented buttons.
-->

<script lang="ts">
  import { useQuaffConfig } from "$internal/quaffConfig.svelte";
  import QBtn from "$components/button/QBtn.svelte";
  import QBtnGroup from "./QBtnGroup.svelte";
  import type { QBtnToggleOption, QBtnToggleProps } from "./props";

  let {
    options,
    value = $bindable(),
    multiple = false,
    clearable,
    connected = true,
    expressive,
    variant = "tonal",
    disabled = false,
    ...props
  }: QBtnToggleProps = $props();

  const quaffConfig = useQuaffConfig();
  const isExpressive = $derived(expressive ?? quaffConfig.expressive);
  const canClearSelection = $derived(clearable ?? multiple);

  function isSelected(option: QBtnToggleOption) {
    return multiple && Array.isArray(value) ? value.includes(option.value) : value === option.value;
  }

  function setSelected(option: QBtnToggleOption, isOptionSelected: boolean | undefined) {
    if (disabled || option.disabled) {
      return;
    }

    const selectedValues = Array.isArray(value) ? value : [];
    const canDeselect = canClearSelection || (multiple && selectedValues.length !== 1);

    if (!isOptionSelected && !canDeselect) {
      return;
    }

    if (multiple) {
      value = isOptionSelected
        ? [...selectedValues, option.value]
        : selectedValues.filter((selectedValue) => selectedValue !== option.value);
      return;
    }

    value = isOptionSelected ? option.value : undefined;
  }
</script>

<QBtnGroup {...props} {connected} expressive={isExpressive} {disabled}>
  {#each options as option (option.value)}
    <QBtn
      type="button"
      label={option.label}
      icon={option.icon}
      aria-label={option["aria-label"]}
      disabled={option.disabled}
      variant={isExpressive ? variant : "outlined"}
      bind:selected={
        () => isSelected(option), (isOptionSelected) => setSelected(option, isOptionSelected)
      }
    />
  {/each}
</QBtnGroup>
