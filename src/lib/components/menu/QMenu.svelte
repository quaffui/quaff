<script lang="ts">
  import { mount, onMount, unmount } from "svelte";
  import { scrollX, scrollY } from "svelte/reactivity/window";
  import type { MenuProps } from "./props";
  import QMenuBase from "./QMenuBase.svelte";

  let { value = $bindable(false), cover, position, target, ...props }: MenuProps = $props();

  const uid = $props.id();
  const id = props.id || "q-menu-" + uid;

  let menuHelperEl = $state<HTMLDivElement>();
  let menuEl = $state<HTMLElement | null>(null);

  let realTarget = $state<HTMLElement | null>(null);

  let mountedMenu: ReturnType<typeof mountMenu> | null = null;

  const targetRect = $derived.by(() => {
    const rect = realTarget?.getBoundingClientRect();

    if (!rect) {
      return undefined;
    }

    return {
      top: rect.top + (scrollY.current || 0),
      left: rect.left + (scrollX.current || 0),
      width: rect.width,
      height: rect.height,
    };
  });

  const width = $derived((cover ? targetRect?.width : menuEl?.offsetWidth) || 0);

  const translateStyle = $derived.by(() => {
    if (!targetRect || !menuEl) {
      return undefined;
    }

    const left =
      position === "left"
        ? targetRect.left - width
        : position === "right"
          ? targetRect.left + targetRect.width
          : targetRect.left;
    const top =
      position === "top"
        ? targetRect.top - (menuEl.offsetHeight || 0)
        : position === "bottom"
          ? targetRect.top + targetRect.height
          : targetRect.top;

    return `${left}px ${top}px`;
  });

  onMount(() => {
    realTarget = target
      ? typeof target === "string"
        ? document.querySelector(target)
        : target
      : null;

    realTarget = realTarget || menuHelperEl?.parentElement?.closest("[data-quaff]") || null;

    if (!realTarget) {
      console.warn(`QMenu (${id}): target not found`);
      return;
    }

    // Attach the menu to the target
    realTarget.setAttribute("popovertarget", id);

    mountedMenu = mountMenu();

    menuEl = document.getElementById(id);

    return () => {
      if (mountedMenu) {
        unmount(mountedMenu);
        mountedMenu = null;
      }

      // Clean up the target attribute
      realTarget?.removeAttribute("popovertarget");
    };
  });

  export function open() {
    if (!mountedMenu?.open) {
      return;
    }

    value = true;
    mountedMenu.open();
  }

  export function close() {
    if (!mountedMenu?.close) {
      return;
    }

    value = false;
    mountedMenu.close();
  }

  export function toggle() {
    if (!mountedMenu?.toggle) {
      return;
    }

    value = !value;
    mountedMenu.toggle();
  }

  function mountMenu() {
    if (!realTarget) {
      return null;
    }

    return mount(QMenuBase, {
      target: document.body,
      props: {
        target: realTarget,
        value,
        translateStyle: () => translateStyle,
        ...props,
        id,
      },
    });
  }
</script>

{#if !target}
  <div bind:this={menuHelperEl} class="q-menu__helper"></div>
{/if}
