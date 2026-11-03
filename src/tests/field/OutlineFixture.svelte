<script lang="ts">
  import { untrack } from "svelte";
  import QInput from "#components/input/QInput.svelte";
  import QSelect from "#components/select/QSelect.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const variant = params.get("variant") ?? "outlined";
  const fieldProps = {
    label: params.has("no-label") ? undefined : "Delivery address for your next order",
    value: params.has("resting") ? null : "Home",
    dense: params.has("dense"),
    disabled: params.has("disabled"),
    error: params.has("error"),
    outlined: variant === "outlined",
    rounded: variant === "rounded",
    filled: variant === "filled" || params.has("filled"),
  };

  if (typeof document !== "undefined") {
    document.documentElement.style.fontSize = `${params.get("size") ?? 16}px`;
  }
</script>

{#snippet prepend()}
  <span aria-hidden="true" style="width: 24px; height: 24px;">@</span>
{/snippet}

{#snippet append()}
  <span aria-hidden="true" style="width: 24px; height: 24px;">+</span>
{/snippet}

<form id="field-form">
  <div
    dir={params.has("rtl") ? "rtl" : "ltr"}
    style="width: {params.get('width') ??
      400}px; margin: 48px; transform: translate(0.25px, 0.25px); --outline: #000; --primary: #000; --error: #000; --on-surface: #000;"
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
        name={params.has("form") ? "address" : undefined}
        required={params.has("form")}
        prepend={params.has("prepend") ? prepend : undefined}
        append={params.has("append") ? append : undefined}
      />
    {/if}
  </div>
</form>
