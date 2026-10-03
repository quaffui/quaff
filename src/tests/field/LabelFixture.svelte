<script module lang="ts">
  import { flushSync, tick, untrack } from "svelte";

  export async function focusField(focused: boolean) {
    flushSync(() => {
      const input = document.querySelector<HTMLInputElement>(".q-field__input")!;

      if (focused) {
        input.focus();
      } else {
        input.blur();
      }
    });
    await tick();
  }
</script>

<script lang="ts">
  import QInput from "$components/input/QInput.svelte";
  import QSelect from "$components/select/QSelect.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const variant = params.get("variant");
  const label = params.has("long") ? "Delivery address for your next order" : "Delivery address";
  const fieldProps = {
    label,
    value: params.has("value") ? "Home" : null,
    dense: params.has("dense"),
    filled: variant === "filled",
    outlined: variant === "outlined",
    rounded: variant === "rounded",
  };

  if (typeof document !== "undefined") {
    document.documentElement.style.fontSize = `${params.get("size") ?? 16}px`;
  }
</script>

{#snippet prepend()}
  {#if params.has("prepend")}
    <span style="width: 24px; height: 24px;">@</span>
  {/if}
{/snippet}

{#snippet append()}
  <span style="width: 80px; height: 24px;">Address</span>
{/snippet}

<div
  dir={params.has("rtl") ? "rtl" : "ltr"}
  style="width: {params.get('width') ?? (params.has('long') ? 240 : 320)}px; margin: 48px;"
>
  {#if params.has("select")}
    <QSelect
      {...fieldProps}
      options={["Home", "Office"]}
      prepend={params.has("prepend") ? prepend : undefined}
      append={params.has("append") ? append : undefined}
    />
  {:else}
    <QInput
      {...fieldProps}
      prepend={params.has("prepend") ? prepend : undefined}
      append={params.has("append") ? append : undefined}
    />
  {/if}
</div>
