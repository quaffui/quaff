<script lang="ts" module>
  import { QContext } from "$utils/context";
  import type { QListProps } from "./props";

  interface QListContext {
    readonly activeClass: string | undefined;
    readonly activeStyle: string | undefined;
    readonly selection: QListProps["selection"];
    readonly separatorOptions: QListProps["separatorOptions"];
  }

  export const listCtx = QContext<QListContext>("QList");
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { quaffConfig } from "$internal/quaffConfig";
  import { getDirection, isArrowKey } from "$utils";

  // #region:    --- Props
  let {
    bordered = false,
    noRound = false,
    dense = false,
    expressive = false,
    segmented = false,
    selection,
    separator = false,
    separatorOptions = {},
    padding = false,
    tag = "div",
    activeClass,
    activeStyle,
    children,
    onfocusin,
    onfocusout,
    onkeydown,
    ...props
  }: QListProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const isExpressive = $derived(expressive || quaffConfig.expressive);
  const role = $derived(props.role ?? (selection ? "listbox" : undefined));
  // #endregion: --- Derived values

  // #region:    --- Non-reactive variables
  let listEl: HTMLElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Context
  listCtx.set({
    activeClass,
    activeStyle,
    selection,
    separatorOptions: separator ? separatorOptions : undefined,
  });
  // #endregion: --- Context

  // #region:    --- Lifecycle
  onMount(resetTabStop);
  // #endregion: --- Lifecycle

  // #region:    --- Functions
  function getActions() {
    return Array.from(listEl.querySelectorAll<HTMLElement>(":scope > .q-item"))
      .flatMap((item) => {
        const nestedActions = Array.from(
          item.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")
        );

        if (!item.hasAttribute("tabindex")) {
          return nestedActions;
        }

        for (const action of nestedActions) {
          action.tabIndex = -1;
        }
        return item;
      })
      .filter(
        (action) => !action.matches(":disabled, [aria-disabled='true'], [aria-disabled='true'] *")
      );
  }

  function setTabStop(actions: HTMLElement[], target?: HTMLElement) {
    for (const action of actions) {
      action.tabIndex = action === target ? 0 : -1;
    }
  }

  function resetTabStop() {
    const actions = getActions();
    const selected = actions.find((action) => action.closest(".q-item--active"));
    setTabStop(actions, selected ?? actions[0]);
  }

  function handleFocusin(event: FocusEvent) {
    onfocusin?.(event as Parameters<NonNullable<QListProps["onfocusin"]>>[0]);

    const target = event.target as HTMLElement;
    const actions = getActions();
    const action = target.closest<HTMLElement>(".q-item[tabindex]") ?? target;
    if (actions.includes(action)) {
      setTabStop(actions, action);
      if (action !== target) {
        action.focus();
      }
    }
  }

  function handleFocusout(event: FocusEvent) {
    onfocusout?.(event as Parameters<NonNullable<QListProps["onfocusout"]>>[0]);

    if (!listEl.contains(event.relatedTarget as Node)) {
      resetTabStop();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    onkeydown?.(event as Parameters<NonNullable<QListProps["onkeydown"]>>[0]);

    if (event.defaultPrevented || !isArrowKey(event)) {
      return;
    }

    const actions = getActions();
    const current = actions.indexOf(event.target as HTMLElement);
    if (current < 0) {
      return;
    }

    event.preventDefault();

    const offset = getDirection(event) === "next" ? 1 : -1;
    const target = actions[(current + offset + actions.length) % actions.length];
    setTabStop(actions, target);
    target.focus();
  }
  // #endregion: --- Functions

  Q.classes("q-list", {
    bemClasses: {
      bordered,
      dense,
      expressive: isExpressive,
      segmented: isExpressive && segmented,
      "no-round": noRound,
    },
    classes: [padding && "q-py-sm", props.class],
  });
</script>

<svelte:element
  this={tag}
  bind:this={listEl}
  {...props}
  class="q-list"
  {role}
  aria-multiselectable={selection === "multiple" || undefined}
  onfocusin={handleFocusin}
  onfocusout={handleFocusout}
  onkeydown={handleKeydown}
  data-quaff
>
  {@render children?.()}
</svelte:element>
