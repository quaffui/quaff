<script lang="ts">
  import { tick } from "svelte";
  import { asset } from "$app/paths";
  import { QChipDocs } from "$components/chip/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBtn, QChip, QInput, QSelect } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QChip — Chip",
      "Use Material 3 assist, filter, input, and suggestion chips in Svelte. Explore QChip selection, avatars, disabled states, styling, and events."
    )
  );

  docsCtx.set({ snippets, componentDocs: QChipDocs });

  const CATEGORIES = [
    { id: "flowers", label: "Flowers", icon: "local_florist" },
    { id: "herbs", label: "Herbs", icon: "eco" },
    { id: "vegetables", label: "Vegetables", icon: "nutrition" },
  ] as const;
  const SEEDS = [
    {
      id: "sunflower",
      name: "Sunflower",
      category: "flowers",
      isSunny: true,
      packets: 14,
    },
    {
      id: "calendula",
      name: "Calendula",
      category: "flowers",
      isSunny: true,
      packets: 8,
    },
    {
      id: "basil",
      name: "Basil",
      category: "herbs",
      isSunny: true,
      packets: 10,
    },
    {
      id: "mint",
      name: "Mint",
      category: "herbs",
      isSunny: false,
      packets: 6,
    },
    {
      id: "lettuce",
      name: "Lettuce",
      category: "vegetables",
      isSunny: false,
      packets: 5,
    },
    {
      id: "peas",
      name: "Peas",
      category: "vegetables",
      isSunny: true,
      packets: 0,
    },
  ] as const;
  const HOST = "Ada Rivers <ada@seed.example>";

  type Packet = { id: number; name: string; sourceId?: string };

  let categories = $state({ flowers: false, herbs: false, vegetables: false });
  let isSunnyOnly = $state(false);
  let hasSunDetails = $state(false);
  let catalog = $state<HTMLElement>();
  let packets = $state<Packet[]>([{ id: 1, name: "Basil", sourceId: "basil" }]);
  let nextPacketId = 2;
  let lastRemoved = $state<Packet>();
  let packetDraft = $state("");
  let chipSize = $state<"sm" | "md" | "lg">("sm");
  let hasEnvelopeReminder = $state(true);
  let host = $state<string | undefined>(HOST);
  let actionStatus = $state("Choose the assist chip to show the swap location.");
  let packetStatus = $state("Basil is in your envelope. Add something new.");

  const hasCategory = $derived(Object.values(categories).some((isSelected) => isSelected));
  const matchingSeeds = $derived(
    SEEDS.filter(
      (seed) => (!hasCategory || categories[seed.category]) && (!isSunnyOnly || seed.isSunny)
    )
  );
  const hostLabel = $derived(host?.split("<", 1)[0].trim() || "Swap partner");

  function getSeedActionLabel(seed: (typeof SEEDS)[number], isInEnvelope: boolean) {
    if (isInEnvelope) {
      return `${seed.name} added`;
    }

    if (seed.packets) {
      return `Add ${seed.name}`;
    }

    return "Next season";
  }

  function suggest(category: "flowers" | "herbs") {
    categories = {
      flowers: category === "flowers",
      herbs: category === "herbs",
      vegetables: false,
    };
    isSunnyOnly = category === "flowers";
  }

  function resetFilters() {
    categories = { flowers: false, herbs: false, vegetables: false };
    isSunnyOnly = false;
  }

  function addPacket(name: string, sourceId?: string) {
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    packets = [...packets, { id: nextPacketId++, name: trimmed, sourceId }];
    packetDraft = "";
    packetStatus = `${trimmed} added. ${packets.length} packets in your envelope.`;
  }

  async function focusAfterUpdate(id: string) {
    await tick();
    const target = document.getElementById(id);
    (target?.querySelector<HTMLElement>(".q-chip__primary") ?? target)?.focus();
  }

  async function removePacket(id: number) {
    const packet = packets.find((packet) => packet.id === id);

    if (!packet) {
      return;
    }

    lastRemoved = packet;
    packets = packets.filter((packet) => packet.id !== id);
    packetStatus = `${packet.name || "Unnamed packet"} removed. You can undo the last removal.`;
    await focusAfterUpdate("seed-undo-removal");
  }

  function restorePacket() {
    if (!lastRemoved) {
      return;
    }

    const restored = lastRemoved;
    packets = [...packets, restored];
    packetStatus = `${restored.name || "Unnamed packet"} restored.`;
    lastRemoved = undefined;
    void focusAfterUpdate(`seed-packet-${restored.id}`);
  }

  function toggleEnvelopeReminder() {
    hasEnvelopeReminder = !hasEnvelopeReminder;
    void focusAfterUpdate("seed-envelope-reminder");
  }

  function togglePartner() {
    host = host === undefined ? HOST : undefined;
    void focusAfterUpdate("seed-swap-partner");
  }
</script>

<QDocs>
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable preview needs keyboard access.) -->
    <div
      class="seed-preview overflow-auto bg-surface-container-low q-pa-lg text-on-surface"
      role="region"
      aria-label="Seed exchange preview"
      tabindex="0"
    >
      <div class="label-medium text-primary">THE NEIGHBORHOOD SEED EXCHANGE</div>
      <h2 class="title-large q-mt-xs q-mb-md">Find seeds to share</h2>
      <QChip
        icon="yard"
        label="Find your first seeds"
        onclick={() => {
          catalog?.scrollIntoView({ block: "start" });
          catalog?.focus({ preventScroll: true });
        }}
      />
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Filter and Suggestion Chips">
      {#snippet sectionDescription()}
        <code>kind="filter"</code> chips bind <code>selected</code> to refine a collection. Selected chips
        replace their leading icon with a check. Try a suggestion, combine categories, or use the sun
        chip's separate information action without changing its selection.
      {/snippet}
      <section
        class="seed-catalog"
        aria-label="Community seed catalog"
        tabindex="-1"
        bind:this={catalog}
      >
        <div class="catalog-heading flex items-center justify-between q-mb-lg">
          <div class="min-width-0">
            <div class="label-medium text-primary">SHARED BY LOCAL GROWERS</div>
            <h3 class="title-large q-mt-xs q-mb-none">Filter the seed list</h3>
          </div>
          <QChip icon="restart_alt" label="All seeds" onclick={resetFilters} />
        </div>
        <div
          class="flex items-center q-gap-md q-mb-lg"
          role="group"
          aria-label="Suggested seed collections"
        >
          <QChip
            kind="suggestion"
            label="A balcony herb garden"
            icon="balcony"
            onclick={() => suggest("herbs")}
          />
          <QChip
            kind="suggestion"
            elevated
            class="tertiary-container"
            label="A sunny flower patch"
            icon="local_florist"
            onclick={() => suggest("flowers")}
          />
        </div>
        <div class="flex items-center q-gap-md" role="group" aria-label="Filter seeds">
          {#each CATEGORIES as category (category.id)}
            <QChip
              kind="filter"
              label={category.label}
              icon={category.icon}
              bind:selected={categories[category.id]}
            />
          {/each}
          <QChip
            kind="filter"
            elevated
            label="Sunny spot"
            icon="wb_sunny"
            bind:selected={isSunnyOnly}
            trailingIcon="info"
            trailingIconLabel="About the sunny spot filter"
            onTrailingIconClick={() => (hasSunDetails = !hasSunDetails)}
          />
        </div>
        {#if hasSunDetails}
          <p class="filter-note body-medium q-pa-md tertiary-container" role="status">
            The sunny spot filter includes only packets marked for a sunny growing space in this
            catalog. It combines with your selected categories.
          </p>
        {/if}
        <p class="body-medium q-my-lg" role="status">
          {matchingSeeds.length}
          {matchingSeeds.length === 1 ? "variety" : "varieties"} to explore
        </p>
        <ul class="seed-results q-ma-none q-pa-none">
          {#each matchingSeeds as seed (seed.id)}
            {@const isInEnvelope = packets.some((packet) => packet.sourceId === seed.id)}
            <li
              class="seed-result flex items-center justify-between no-border-radius q-gap-md q-py-md"
            >
              <div class="min-width-0">
                <span class="title-medium">{seed.name}</span>
                <span class="body-medium text-on-surface-variant">
                  · {seed.packets ? `${seed.packets} packets available` : "Unavailable"}
                </span>
              </div>
              <QChip
                icon={isInEnvelope ? "check" : "add"}
                label={getSeedActionLabel(seed, isInEnvelope)}
                disabled={isInEnvelope || !seed.packets}
                onclick={() => addPacket(seed.name, seed.id)}
              />
            </li>
          {:else}
            <li class="body-medium q-py-md">
              No packets match these filters. Try another category or choose All seeds.
            </li>
          {/each}
        </ul>
      </section>
      <p class="body-medium q-mt-md q-mb-none">
        Assist is the default <code>kind</code>. Assist, filter, and suggestion chips are outlined
        by default; <code>elevated</code> adds a surface and shadow. <code>disabled</code> keeps unavailable
        actions out of the keyboard order.
      </p>
    </QDocsSection>

    <QDocsSection title="Editable and Removable Chips">
      {#snippet sectionDescription()}
        Input chips turn small pieces of information into editable, removable items. Bind
        <code>value</code> to edit a packet name. The trailing action removes it; Enter, Escape, or leaving
        the editor returns to the chip while keeping the current text.
      {/snippet}
      <div class="envelope border q-pa-lg">
        <h3 class="title-large q-mt-none q-mb-lg">Editable packet labels</h3>
        <form
          class="packet-form flex items-center q-gap-md q-my-lg"
          onsubmit={(event) => {
            event.preventDefault();
            addPacket(packetDraft);
            void focusAfterUpdate("seed-packet-name");
          }}
        >
          <QInput
            id="seed-packet-name"
            label="Name a seed packet"
            bind:value={packetDraft}
            maxlength={64}
            outlined
            class="min-width-0"
          />
          <QBtn
            type="submit"
            variant="tonal"
            icon="add"
            label="Add packet"
            disabled={!packetDraft.trim()}
          />
        </form>
        <div
          class="flex items-center q-gap-md q-mb-lg"
          role="group"
          aria-label="Packets in your envelope"
        >
          {#each packets as packet (packet.id)}
            <QChip
              id={`seed-packet-${packet.id}`}
              kind="input"
              icon="eco"
              size={chipSize}
              label={packet.name.trim() || "Unnamed packet"}
              bind:value={packet.name}
              trailingIcon="close"
              trailingIconLabel={`Remove ${packet.name.trim() || "unnamed packet"}`}
              onTrailingIconClick={() => removePacket(packet.id)}
            />
          {:else}<p class="body-medium q-ma-none">
              Your envelope is empty. Add a packet above or choose one from the catalog.
            </p>{/each}
        </div>
        <div class="envelope-tools flex items-center q-gap-md">
          <QSelect
            label="Packet label size"
            options={["sm", "md", "lg"]}
            bind:value={chipSize}
            outlined
          />
          <QBtn
            id="seed-undo-removal"
            variant="flat"
            icon="undo"
            label="Undo last removal"
            disabled={!lastRemoved}
            onclick={restorePacket}
          />
        </div>
        <p class="body-medium q-mt-md q-mb-none" role="status">{packetStatus}</p>
        <div class="packing-note no-border-radius q-mt-lg">
          <div class="label-medium text-on-surface-variant q-mb-md">LABEL-ONLY INPUT CHIP</div>
          {#if hasEnvelopeReminder}
            <QChip
              id="seed-envelope-reminder"
              kind="input"
              icon="inventory_2"
              label="Bring spare envelopes"
              trailingIcon="close"
              onTrailingIconClick={toggleEnvelopeReminder}
            />
          {:else}
            <QChip
              id="seed-envelope-reminder"
              kind="suggestion"
              icon="add"
              label="Add envelope reminder"
              onclick={toggleEnvelopeReminder}
            />
          {/if}
          <p class="body-small text-on-surface-variant q-mt-md q-mb-none">
            This reminder has no editable value. Its label and close icon form one removal action.
          </p>
        </div>
      </div>
      <p class="body-medium q-mt-md q-mb-none">
        Tab reaches editing and removal separately. Space or Enter activates a focused action;
        Backspace or Delete removes a focused input chip. Customize the removal name with <code
          >trailingIconLabel</code
        >. Sizes are <code>sm</code> (default), <code>md</code>, and <code>lg</code>.
      </p>
    </QDocsSection>

    <QDocsSection title="Avatars, Labels and Actions">
      {#snippet sectionDescription()}
        Prefix <code>icon</code> with <code>img:</code> for an avatar. An input chip's displayed
        <code>label</code> can be shorter than its editable <code>value</code>: this partner chip
        shows a name while preserving the contact address.
      {/snippet}
      <div class="flex column q-gap-lg">
        <div class="chip-example min-width-0 bg-surface-container-low q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-md">A name with an editable address</h3>
          {#if host !== undefined}
            <QChip
              id="seed-swap-partner"
              kind="input"
              icon={`img:${asset("docs/seed-exchange-emblem.svg")}`}
              label={hostLabel}
              bind:value={host}
              trailingIcon="close"
              trailingIconLabel="Remove swap partner"
              onTrailingIconClick={togglePartner}
            />
            <p class="body-medium text-on-surface-variant contact-value q-mt-md q-mb-none">
              {host || "Add your partner's name and address by editing the chip."}
            </p>
          {:else}
            <QChip
              id="seed-swap-partner"
              kind="suggestion"
              icon="person_add"
              label="Restore swap partner"
              onclick={togglePartner}
            />
          {/if}
        </div>
        <div class="chip-example min-width-0 bg-surface-container-low q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-md">A contextual action</h3>
          <QChip
            noRipple
            class="primary-container"
            icon="location_on"
            label="Show swap location"
            onclick={() => (actionStatus = "Community potting shed · Saturday 10:00–12:00.")}
          />
          <p class="body-medium q-mt-md q-mb-none" role="status">{actionStatus}</p>
        </div>
      </div>
      <p class="body-medium q-mt-md q-mb-none">
        Use <code>onclick</code> for contextual actions and <code>onTrailingIconClick</code> for a
        separate trailing action. Add a class to use theme colors. Ripple feedback is enabled by
        default; the location chip uses <code>noRipple</code>. Suggestion and assist chips do not
        support trailing icons, and input chips do not use elevation.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }

  .seed-preview {
    width: min(100%, 360px);
    max-height: 100%;
    border-radius: 24px;
  }
  .seed-catalog {
    scroll-margin-block-start: 100px;
  }
  .catalog-heading {
    gap: 20px;
  }
  .catalog-heading > div {
    overflow-wrap: anywhere;
  }
  .filter-note {
    margin-top: 20px;
    border-radius: 16px;
  }
  .seed-results {
    list-style: none;
  }
  .seed-result + .seed-result {
    border-block-start: 1px solid var(--outline-variant);
  }
  .seed-result > div {
    flex: 1 1 160px;
    overflow-wrap: anywhere;
  }
  .envelope {
    max-width: 800px;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }
  .packet-form :global(.q-field) {
    flex: 1 1 224px;
  }
  .envelope-tools :global(.q-field) {
    width: min(100%, 224px);
  }
  .packing-note {
    padding-top: 20px;
    border-top: 1px solid var(--outline-variant);
  }
  .chip-example {
    border-radius: 24px;
  }
  .contact-value {
    overflow-wrap: anywhere;
  }
  @media (max-width: 599px) {
    .envelope,
    .chip-example {
      padding: 16px;
    }
  }
</style>
