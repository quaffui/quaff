<script lang="ts" module>
  import { QContext } from "$utils/context";
  import type { QListProps } from "./props";

  interface QListContext {
    readonly activeClass: string | undefined;
    readonly activeStyle: string | undefined;
    readonly dense: boolean;
    readonly expressive: boolean;
    readonly noRound: boolean;
    readonly selection: QListProps["selection"];
    readonly separatorOptions: QListProps["separatorOptions"];
    readonly claimInitialExpansion: (name: string) => boolean;
    readonly openExpansion: (name: string, current: () => void) => () => void;
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
  let hasMounted = false;
  // This registry must stay non-reactive so registration effects cannot invalidate themselves.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const expansionGroups = new Map<string, () => void>();
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const initiallyOpenExpansionGroups = new Set<string>();
  // #endregion: --- Non-reactive variables

  // #region:    --- Context
  listCtx.set({
    activeClass,
    activeStyle,
    dense,
    expressive: isExpressive,
    noRound,
    selection,
    separatorOptions: separator ? separatorOptions : undefined,
    claimInitialExpansion,
    openExpansion,
  });
  // #endregion: --- Context

  // #region:    --- Lifecycle
  onMount(() => {
    hasMounted = true;
    initiallyOpenExpansionGroups.clear();
    resetTabStop();
  });
  // #endregion: --- Lifecycle

  // #region:    --- Functions
  function claimInitialExpansion(name: string) {
    if (hasMounted) {
      return true;
    }

    if (initiallyOpenExpansionGroups.has(name)) {
      return false;
    }

    initiallyOpenExpansionGroups.add(name);
    return true;
  }

  function openExpansion(name: string, current: () => void) {
    const previous = expansionGroups.get(name);
    if (previous !== current) {
      previous?.();
    }

    expansionGroups.set(name, current);

    return () => {
      if (expansionGroups.get(name) === current) {
        expansionGroups.delete(name);
      }
    };
  }

  function getItemActions(item: HTMLElement) {
    const nestedActions = Array.from(
      item.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")
    );

    if (!item.hasAttribute("tabindex")) {
      return nestedActions;
    }

    for (const action of nestedActions) {
      action.tabIndex = -1;
    }
    return [item];
  }

  function getActions() {
    return Array.from(listEl.children)
      .flatMap((child) => {
        if (!(child instanceof HTMLElement)) {
          return [];
        }

        if (child.matches(".q-item")) {
          return getItemActions(child);
        }

        if (!child.matches(".q-expansion-item")) {
          return [];
        }

        const headerItem = child.querySelector<HTMLElement>(
          ":scope > .q-expansion-item__item, :scope > .q-expansion-item__header > .q-expansion-item__item"
        );
        const toggle = child.querySelector<HTMLElement>(
          ":scope > .q-expansion-item__header > .q-expansion-item__toggle-icon"
        );

        return [...(headerItem ? getItemActions(headerItem) : []), ...(toggle ? [toggle] : [])];
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
    const action = actions.find((candidate) => candidate === target || candidate.contains(target));
    if (action) {
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
    const eventTarget = event.target as HTMLElement;
    const current = actions.findIndex(
      (action) => action === eventTarget || action.contains(eventTarget)
    );
    if (current < 0) {
      return;
    }

    event.preventDefault();

    const offset = getDirection(event) === "next" ? 1 : -1;
    const nextAction = actions[(current + offset + actions.length) % actions.length];
    setTabStop(actions, nextAction);
    nextAction.focus();
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
