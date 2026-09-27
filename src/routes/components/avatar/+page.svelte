<script lang="ts">
  import { base } from "$app/paths";
  import { QAvatarDocs } from "$components/avatar/docs";
  import type { QAvatarProps } from "$components/avatar/props";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QAvatar, QBtn, QIcon, QSelect, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QAvatar — Avatar",
      "Display photos, initials, icons, or video with Quaff's Svelte avatar component. Explore sizes, shapes, custom content, and accessible examples."
    )
  );

  docsCtx.set({ snippets, componentDocs: QAvatarDocs });

  const CREW = [
    {
      id: "alex",
      name: "Alex Taylor",
      initials: "AT",
      role: "Marine ecologist",
      color: "primary-container",
    },
    {
      id: "sam",
      name: "Sam Reed",
      initials: "SR",
      role: "Field technician",
      color: "tertiary-container",
    },
    {
      id: "jamie",
      name: "Jamie Wells",
      initials: "JW",
      role: "Research diver",
      color: "secondary-container",
    },
  ] as const;
  const SIZES = [
    { label: "xs · 32px", value: "xs" },
    { label: "sm · 40px (default)", value: "sm" },
    { label: "md · 48px", value: "md" },
    { label: "lg · 56px", value: "lg" },
    { label: "xl · 64px", value: "xl" },
    { label: "Custom · 24px", value: "24px" },
    { label: "Custom · 80px", value: "80px" },
    { label: "Text-relative · 5rem", value: "5rem" },
  ];
  const SHAPES = [
    "circle",
    "square",
    "top-round",
    "bottom-round",
    "left-round",
    "right-round",
    "top-left-round",
    "top-right-round",
    "bottom-left-round",
    "bottom-right-round",
  ];

  let crewId = $state<(typeof CREW)[number]["id"]>("alex");
  let size = $state<NonNullable<QAvatarProps["size"]>>("lg");
  let shape = $state<NonNullable<QAvatarProps["shape"]>>("circle");
  let showImage = $state(true);
  let paused = $state(true);
  const selectedCrew = $derived(CREW.find((member) => member.id === crewId) ?? CREW[0]);
</script>

<QDocs>
  {#snippet display()}
    <div class="station-preview text-on-surface text-center">
      <QAvatar src={`${base}/avatar-research-vessel.svg`} size="80px" />
      <div class="label-medium q-mt-lg">TIDEPOOL FIELD STATION</div>
      <h2 class="title-large q-mt-xs q-mb-sm">A small crew. A big blue world.</h2>
      <div
        class="flex justify-center q-gap-sm q-mt-md"
        aria-label="Three crew members on today's survey"
      >
        {#each CREW as member (member.id)}
          <QAvatar class={member.color} role="img" aria-label={member.name}
            >{member.initials}</QAvatar
          >
        {/each}
      </div>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Interactive Profiles">
        {#snippet sectionDescription()}
          Avatars identify people at a glance. Wrap them in labelled buttons when they select a
          profile or perform an action. Choose a crew member to update the selected identity.
        {/snippet}
        <section
          class="station-card q-pa-lg text-on-surface"
          aria-label="Tidepool field station crew"
        >
          <div class="station-heading flex items-center q-gap-md text-primary">
            <QIcon name="waves" size="32px" aria-hidden="true" />
            <div>
              <div class="label-medium">TIDEPOOL FIELD STATION</div>
              <h2 class="title-large q-ma-none">Choose a crew member</h2>
            </div>
          </div>
          <div class="crew-choices q-gap-sm q-my-lg" role="group" aria-label="Choose a crew member">
            {#each CREW as member (member.id)}
              <button
                type="button"
                class="crew-choice flex column items-center q-gap-sm text-on-surface"
                aria-pressed={crewId === member.id}
                onclick={() => (crewId = member.id)}
              >
                <QAvatar size="lg" class={member.color} aria-hidden="true"
                  >{member.initials}</QAvatar
                >
                <span class="label-large">{member.name}</span>
              </button>
            {/each}
          </div>
          <p class="body-medium q-ma-none" role="status">
            Selected: {selectedCrew.name} · {selectedCrew.role}
          </p>
        </section>
      </QDocsSection>

      <QDocsSection title="Images, Initials and Icons">
        {#snippet sectionDescription()}
          Use <code>src</code> for an image, or put initials and icons in the default snippet.
          Initials use <code>title-medium</code> typography and primary container colors; theme classes
          let each identity stand out.
        {/snippet}

        <div class="identity-grid q-gap-md">
          <div class="identity-card flex items-center q-gap-md">
            <QAvatar src={`${base}/avatar-research-vessel.svg`} size="xl" />
            <div>
              <h3 class="title-medium q-ma-none">RV Tern</h3>
              <p class="body-medium q-mt-xs q-mb-none">Our floating field lab</p>
            </div>
          </div>
          <div class="identity-card flex items-center q-gap-md">
            <QAvatar size="xl" class="tertiary-container" aria-hidden="true">SR</QAvatar>
            <div>
              <h3 class="title-medium q-ma-none">Sam Reed</h3>
              <p class="body-medium q-mt-xs q-mb-none">Equipment & observations</p>
            </div>
          </div>
          <div class="identity-card flex items-center q-gap-md">
            <QAvatar size="xl" class="secondary" aria-hidden="true"
              ><QIcon name="science" size="28px" /></QAvatar
            >
            <div>
              <h3 class="title-medium q-ma-none">Water lab</h3>
              <p class="body-medium q-mt-xs q-mb-none">Samples from the morning tide</p>
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Size and Shape">
        {#snippet sectionDescription()}
          Named sizes range from <code>xs</code> (32px) to <code>xl</code> (64px); the default is
          <code>sm</code> (40px). Custom sizes accept CSS lengths or numbers in pixels. Images and icons
          keep their dimensions while named-size initials can grow with text. A circle is the Material
          3 default; the other shapes are Quaff extensions.
        {/snippet}

        <div class="flex items-start q-gap-lg">
          <div class="avatar-controls q-gap-md">
            <QSelect label="Avatar size" options={SIZES} bind:value={size} emitValue outlined />
            <QSelect label="Avatar shape" options={SHAPES} bind:value={shape} emitValue outlined />
            <QSwitch label="Use vessel illustration" bind:value={showImage} />
          </div>
          <div class="vessel-card">
            <div class="label-medium text-on-surface-variant">VESSEL DIRECTORY</div>
            <div class="vessel-identity flex items-center q-gap-md q-my-lg">
              <QAvatar
                {size}
                {shape}
                src={showImage ? `${base}/avatar-research-vessel.svg` : undefined}
                aria-hidden="true">RT</QAvatar
              >
              <div>
                <h3 class="title-large q-ma-none">RV Tern</h3>
                <p class="body-medium q-mt-xs q-mb-none">Survey boat · Berth 04</p>
              </div>
            </div>
            <div
              class="vessel-status body-medium flex items-center q-gap-sm text-on-surface-variant"
            >
              <QIcon name="anchor" size="20px" aria-hidden="true" /> Back before high tide
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Video Avatars">
        {#snippet sectionDescription()}
          Set <code>video</code> with an MP4 <code>src</code>, or provide typed <code>sources</code>
          for other formats. Videos are muted and loop. They autoplay by default; start with
          <code>paused</code> and bind it to a playback control when motion is optional.
        {/snippet}

        <div class="galley-card flex items-center">
          <QAvatar
            video
            size="80px"
            shape="top-left-round"
            sources={[{ src: `${base}/cocktail.mp4`, type: "video/mp4" }]}
            bind:paused
            aria-hidden="true"
          >
            {#snippet videoAccessibility()}
              <p>A citrus drink being prepared in the galley.</p>
            {/snippet}
          </QAvatar>
          <div class="galley-copy">
            <div class="label-medium text-on-surface-variant">BACK AT THE STATION</div>
            <h3 class="title-large q-mt-xs q-mb-none">A round for the shore team</h3>
            <p class="body-medium q-mt-sm q-mb-none">
              Citrus on ice, from the galley. Recorded clip · no audio.
            </p>
          </div>
          <QBtn
            variant="tonal"
            icon={paused ? "play_arrow" : "pause"}
            label={paused ? "Play clip" : "Pause clip"}
            onclick={() => (paused = !paused)}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessible Identities">
        {#snippet sectionDescription()}
          Images default to <code>alt=""</code> when nearby text already names them. Give an
          informative image meaningful <code>alt</code> text. For standalone initials, icons or
          video, use <code>role="img"</code> and an accessible name. Wrap interactive avatars in a labelled
          button or link, as in the crew picker above.
        {/snippet}

        <div class="identity-grid q-gap-md">
          <div class="identity-card flex items-center q-gap-md">
            <QAvatar
              src={`${base}/avatar-research-vessel.svg`}
              size="lg"
              alt="Illustration of a yellow research boat at sea"
            />
            <span class="body-medium">An image with its own description</span>
          </div>
          <div class="identity-card flex items-center q-gap-md">
            <QAvatar role="img" aria-label="Alex Taylor" size="lg">AT</QAvatar>
            <span class="body-medium">Initials with an accessible name</span>
          </div>
        </div>
        <p class="body-medium q-mt-lg q-mb-none">
          The <code>videoAccessibility</code> snippet accepts caption tracks and fallback content. Fallback
          text alone does not provide captions or playback controls.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }

  .station-preview {
    width: 100%;
    max-width: 320px;
    max-height: 100%;
    overflow: auto;
    padding: 20px;
    border-radius: 24px;
    background: var(--surface-container-low);
  }

  .station-preview > :global(.q-avatar) {
    margin-inline: auto;
  }

  .station-card {
    width: 100%;
    max-width: 480px;
    border: 1px solid var(--outline-variant);
    border-radius: 24px;
    background: var(--surface-container-low);
  }

  .station-heading,
  .identity-card,
  .vessel-identity,
  .vessel-status {
    flex-wrap: nowrap;
  }

  .crew-choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 7rem), 1fr));
  }

  .crew-choice {
    flex-wrap: nowrap;
    padding: 12px 4px;
    border: 2px solid transparent;
    border-radius: 16px;
    background: transparent;
    font: inherit;
    cursor: pointer;
    overflow-wrap: anywhere;
  }

  .crew-choice[aria-pressed="true"] {
    border-color: var(--primary);
    background: var(--surface-container-high);
  }

  .crew-choice:hover {
    background: var(--surface-container-highest);
  }

  .crew-choice:focus-visible {
    outline: 3px solid var(--secondary);
    outline-offset: 3px;
  }

  .identity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  }

  .identity-card,
  .vessel-card,
  .galley-card {
    padding: 20px;
    border-radius: 20px;
    background: var(--surface-container-low);
  }

  .identity-card > div,
  .identity-card > span,
  .vessel-identity > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .avatar-controls {
    display: grid;
    flex: 1 1 224px;
    min-width: 0;
  }

  .vessel-card {
    flex: 2 1 320px;
    min-width: 0;
  }

  .vessel-identity {
    flex-wrap: wrap;
  }

  .galley-card {
    gap: 20px;
  }

  .galley-copy {
    flex: 1 1 240px;
    min-width: 0;
  }

  @media (max-width: 400px) {
    .crew-choices {
      grid-template-columns: 1fr;
    }

    .crew-choice {
      flex-direction: row;
      padding: 8px;
      text-align: start;
    }
  }
</style>
