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
    readonly refreshTabStop: (action?: HTMLElement, tabIndex?: number) => void;
    readonly claimInitialExpansion: (name: string) => boolean;
    readonly openExpansion: (name: string, current: () => void) => () => void;
  }

  export const listCtx = QContext<QListContext>("QList");
</script>

<script lang="ts">
  import { onMount, tick } from "svelte";
  import { quaffConfig } from "$internal/quaffConfig";
  import { menuCtx } from "$internal/menuContext";
  import { getDirection, isArrowKey } from "$utils";

  // #region:    --- Props
  let {
    bordered = false,
    noRound = false,
    dense = false,
    expressive,
    segmented = false,
    selection,
    preserveTabOrder = false,
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

  // #region:    --- Reactive variables
  let listEl = $state<HTMLElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const isInMenu = menuCtx.get() ?? false;
  const isExpressive = $derived(expressive ?? (!isInMenu && quaffConfig.expressive));
  const role = $derived(props.role ?? (selection ? "listbox" : undefined));
  // #endregion: --- Derived values

  // #region:    --- Non-reactive variables
  let hasMounted = false;
  let navigationActive = false;
  let refreshPending = false;
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const originalTabIndexes = new Map<HTMLElement, string | null>();
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
    refreshTabStop,
    claimInitialExpansion,
    openExpansion,
  });
  // #endregion: --- Context

  // #region:    --- Effects
  $effect(() => {
    if (preserveTabOrder || !listEl) {
      return;
    }

    navigationActive = true;
    refreshTabStop();

    return () => {
      navigationActive = false;
      restoreTabIndexes();
    };
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => {
    hasMounted = true;
    initiallyOpenExpansionGroups.clear();
  });
  // #endregion: --- Lifecycle

  // #region:    --- Functions
  function refreshTabStop(action?: HTMLElement, tabIndex?: number) {
    if (action && originalTabIndexes.has(action) && tabIndex !== undefined) {
      originalTabIndexes.set(action, String(tabIndex));
    }

    if (!navigationActive || refreshPending) {
      return;
    }

    // Batch item notifications until Svelte has finished updating the list.
    refreshPending = true;
    void resetTabStopAfterUpdate();
  }

  async function resetTabStopAfterUpdate() {
    await tick();
    refreshPending = false;

    if (navigationActive) {
      resetTabStop();
    }
  }

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
      setTabIndex(action, -1);
    }
    return [item];
  }

  function getActions() {
    return Array.from(listEl?.children ?? [])
      .flatMap((child) => {
        if (!(child instanceof HTMLElement)) {
          return [];
        }

        if (child.matches(".q-nav-item")) {
          return [child];
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
      .filter((action) => {
        if (!action.matches(":disabled, [aria-disabled='true'], [aria-disabled='true'] *")) {
          return true;
        }

        setTabIndex(action, -1);
        return false;
      });
  }

  function setTabIndex(action: HTMLElement, tabIndex: number) {
    const currentTabIndex = action.getAttribute("tabindex");

    if (!originalTabIndexes.has(action)) {
      originalTabIndexes.set(action, currentTabIndex);
    }

    if (currentTabIndex !== String(tabIndex)) {
      action.tabIndex = tabIndex;
    }
  }

  function restoreTabIndexes(actions: Iterable<HTMLElement> = originalTabIndexes.keys()) {
    for (const action of actions) {
      const tabIndex = originalTabIndexes.get(action) ?? null;

      if (tabIndex === null) {
        action.removeAttribute("tabindex");
      } else {
        action.setAttribute("tabindex", tabIndex);
      }

      originalTabIndexes.delete(action);
    }
  }

  function setTabStop(actions: HTMLElement[], target?: HTMLElement) {
    for (const action of actions) {
      setTabIndex(action, action === target ? 0 : -1);
    }
  }

  function resetTabStop() {
    restoreTabIndexes([...originalTabIndexes.keys()].filter((action) => !listEl?.contains(action)));
    const actions = getActions();
    const visibleActions = actions.filter((action) =>
      action.checkVisibility({ visibilityProperty: true })
    );
    const tabStopCandidates = visibleActions.length ? visibleActions : actions;
    const focused = tabStopCandidates.find((action) => action.contains(document.activeElement));
    const selected = tabStopCandidates.find((action) =>
      action.closest(".q-item--active, .q-nav-item--active")
    );
    setTabStop(actions, focused ?? selected ?? tabStopCandidates[0]);
  }

  function handleFocusin(event: FocusEvent) {
    onfocusin?.(event as Parameters<NonNullable<QListProps["onfocusin"]>>[0]);

    if (preserveTabOrder) {
      return;
    }

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

    if (!preserveTabOrder && !listEl?.contains(event.relatedTarget as Node)) {
      resetTabStop();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    onkeydown?.(event as Parameters<NonNullable<QListProps["onkeydown"]>>[0]);

    if (preserveTabOrder || event.defaultPrevented || !isArrowKey(event)) {
      return;
    }

    const actions = getActions().filter((action) =>
      action.checkVisibility({ visibilityProperty: true })
    );
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
