<script lang="ts">
  import { resolve } from "$app/paths";
  import { QCodeBlock, QIcon, QSwitch, Quaff } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import { PALETTE_COLORS } from "#docs/colorPalette.js";

  useMeta(
    pageMeta(
      "Colors & CSS Classes",
      "Use Quaff's theme roles, color classes, and CSS variables. Preview light and dark colors and browse the fixed palette shades."
    )
  );

  let previewMode = $state<"light" | "dark">();
</script>

<div class="q-page">
  <h1 class="q-mb-md">Colors</h1>
  <p class="body-large q-mb-xl">
    Use theme roles for your UI. Use fixed palette shades when a color should stay the same in light
    and dark mode.
  </p>

  <section aria-labelledby="theme-roles-heading" class="q-mb-xl">
    <h2 id="theme-roles-heading" class="headline-medium q-mb-md">Theme roles</h2>
    <p class="q-mb-md">
      <code class="q-docs-code">primary</code>, <code class="q-docs-code">secondary</code> and
      <code class="q-docs-code">tertiary</code>
      are accent colors. Use
      <code class="q-docs-code">surface</code>
      and <code class="q-docs-code">surface-container-*</code> for content, and
      <code class="q-docs-code">error</code>, <code class="q-docs-code">success</code> or
      <code class="q-docs-code">warning</code> for status.
    </p>
    <p class="q-mb-lg">
      Paired classes such as <code class="q-docs-code">primary-container</code> set a background and
      its matching
      <code class="q-docs-code">on-*</code> text color. Theme roles adapt to light and dark mode. Change
      the preview below without changing the rest of the site.
    </p>
    <QSwitch
      bind:value={
        () => (previewMode ? previewMode === "dark" : Quaff.darkMode.isActive),
        (value) => (previewMode = value ? "dark" : "light")
      }
      label="Dark preview"
      icons
      class="q-mb-md" />
    <article
      class="pickup-card surface-container-low q-pa-lg q-mb-lg"
      style:color-scheme={previewMode}
      aria-labelledby="pickup-heading">
      <div class="flex no-wrap items-start q-gap-md">
        <div class="parcel-icon primary-container flex flex-center" aria-hidden="true">
          <QIcon name="package_2" size="32px" />
        </div>
        <div class="min-width-0">
          <p class="label-medium text-on-surface-variant q-mt-none q-mb-xs">
            RIVERSIDE PARCEL DESK
          </p>
          <h3 id="pickup-heading" class="title-large text-primary q-mb-sm">Your parcel is ready</h3>
          <p class="body-medium text-on-surface-variant q-ma-none">Locker 12 · Collect by Friday</p>
        </div>
      </div>
      <div class="flex items-center q-gap-md q-mt-lg">
        <span class="pickup-status success-container label-large q-px-md q-py-sm">
          Ready for pickup
        </span>
        <span class="body-medium">Bring your pickup code.</span>
      </div>
    </article>
    <QCodeBlock
      language="html"
      code={`<article class="surface-container-low q-pa-lg">
  <h3 class="title-large text-primary">Your parcel is ready</h3>
  <p class="text-on-surface-variant">Locker 12 · Collect by Friday</p>
  <span class="success-container q-pa-sm">Ready for pickup</span>
</article>`}
      copiable />
    <p class="q-mt-md">
      Use <code class="q-docs-code">surface-container-lowest</code>,
      <code class="q-docs-code">-low</code>, <code class="q-docs-code">surface-container</code>,
      <code class="q-docs-code">-high</code> and <code class="q-docs-code">-highest</code> for
      different surface levels. They pair with
      <code class="q-docs-code">on-surface</code>; use
      <code class="q-docs-code">text-on-surface-variant</code>
      for supporting text. See
      <a class="q-docs-link" href={resolve("/utils/q-theme")}>QTheme</a>
      to change the theme and <a class="q-docs-link" href={resolve("/utils/quaff")}>Quaff</a> to set the
      app's display mode.
    </p>
  </section>

  <section aria-labelledby="color-classes-heading" class="q-mb-xl">
    <h2 id="color-classes-heading" class="headline-medium q-mb-md">Color classes</h2>
    <p class="q-mb-lg">
      Replace <code class="q-docs-code">&lt;color&gt;</code> with a theme color or palette name,
      such as
      <code class="q-docs-code">primary</code>, <code class="q-docs-code">on-surface</code>,
      <code class="q-docs-code">blue</code>
      or <code class="q-docs-code">blue-3</code>.
    </p>
    <dl class="class-reference q-gap-y-md q-gap-x-lg q-mb-lg">
      <dt><code class="q-docs-code">primary-container</code></dt>
      <dd class="q-ma-none">Paired theme class: background and matching text.</dd>
      <dt><code class="q-docs-code">bg-&lt;color&gt;</code></dt>
      <dd class="q-ma-none">
        Background only: <code class="q-docs-code">bg-primary</code>,
        <code class="q-docs-code">bg-blue</code>, <code class="q-docs-code">bg-blue-3</code>.
      </dd>
      <dt><code class="q-docs-code">text-&lt;color&gt;</code></dt>
      <dd class="q-ma-none">
        Text only: <code class="q-docs-code">text-on-surface</code>,
        <code class="q-docs-code">text-blue</code>, <code class="q-docs-code">text-blue-10</code>.
      </dd>
      <dt><code class="q-docs-code">border-&lt;color&gt;</code></dt>
      <dd class="q-ma-none">
        Border color: <code class="q-docs-code">border-outline</code>,
        <code class="q-docs-code">border-blue</code>,
        <code class="q-docs-code">border-blue-6</code>. Add <code class="q-docs-code">border</code> for
        a visible border.
      </dd>
    </dl>
    <QCodeBlock
      language="html"
      code={`<!-- These use the same color pair. -->
<div class="primary-container q-pa-md">Delivery details</div>
<div class="bg-primary-container text-on-primary-container q-pa-md">
  Delivery details
</div>

<div class="border border-outline q-pa-md">Pickup instructions</div>`}
      copiable />
    <h3 class="title-large q-mt-lg q-mb-md">Supported theme colors</h3>
    <ul class="role-reference column q-gap-md">
      <li>
        <strong>Accents and status:</strong> <code class="q-docs-code">primary</code>,
        <code class="q-docs-code">secondary</code>,
        <code class="q-docs-code">tertiary</code>, <code class="q-docs-code">error</code>,
        <code class="q-docs-code">success</code>, <code class="q-docs-code">warning</code>. Each has
        <code class="q-docs-code">on-&lt;name&gt;</code>,
        <code class="q-docs-code">&lt;name&gt;-container</code>
        and
        <code class="q-docs-code">on-&lt;name&gt;-container</code> colors.
      </li>
      <li>
        <strong>Surfaces:</strong> <code class="q-docs-code">background</code>,
        <code class="q-docs-code">surface</code>,
        <code class="q-docs-code">surface-variant</code> and their
        <code class="q-docs-code">on-&lt;name&gt;</code>
        colors;
        <code class="q-docs-code">surface-dim</code> and
        <code class="q-docs-code">surface-bright</code>.
      </li>
      <li>
        <strong>Containers:</strong> <code class="q-docs-code">surface-container</code>,
        <code class="q-docs-code">surface-container-lowest</code>,
        <code class="q-docs-code">surface-container-low</code>,
        <code class="q-docs-code">surface-container-high</code>,
        <code class="q-docs-code">surface-container-highest</code>.
      </li>
      <li>
        <strong>Outlines:</strong> <code class="q-docs-code">outline</code>,
        <code class="q-docs-code">outline-variant</code>.
      </li>
      <li>
        <strong>Inverse colors:</strong> <code class="q-docs-code">inverse-surface</code>,
        <code class="q-docs-code">inverse-on-surface</code>,
        <code class="q-docs-code">inverse-primary</code>.
      </li>
      <li>
        <strong>Other:</strong> <code class="q-docs-code">shadow</code>,
        <code class="q-docs-code">scrim</code>, <code class="q-docs-code">surface-tint</code>.
      </li>
    </ul>
  </section>

  <section aria-labelledby="css-variables-heading" class="q-mb-xl">
    <h2 id="css-variables-heading" class="headline-medium q-mb-md">CSS variables</h2>
    <p class="q-mb-md">
      Theme variables use the role name, such as <code class="q-docs-code">--primary-container</code
      >. Palette variables use the <code class="q-docs-code">--color-</code> prefix, such as
      <code class="q-docs-code">--color-teal-6</code>. Some tokens, such as
      <code class="q-docs-code">--primary-fixed</code>
      and <code class="q-docs-code">--primary-dim</code>, have no helper class; use their CSS
      variables directly.
    </p>
    <QCodeBlock
      language="css"
      code={`.pickup-note {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  border: 1px solid var(--outline);
}

.route-marker {
  background-color: var(--color-teal-6);
}`}
      copiable />
  </section>

  <section aria-labelledby="palette-heading">
    <h2 id="palette-heading" class="headline-medium q-mb-md">Fixed palette</h2>
    <p class="q-mb-md">
      Each palette has ten shades: <code class="q-docs-code">1</code> is the lightest and
      <code class="q-docs-code">10</code>
      the darkest. Without a number, <code class="q-docs-code">bg-teal</code>,
      <code class="q-docs-code">text-teal</code>
      and <code class="q-docs-code">border-teal</code> use shade <code class="q-docs-code">6</code>.
      For example, <code class="q-docs-code">text-teal</code> is
      <code class="q-docs-code">text-teal-6</code>.
    </p>
    <p class="q-mb-lg">
      Use <code class="q-docs-code">bg-teal-2</code>, <code class="q-docs-code">text-teal-10</code>
      or <code class="q-docs-code">border-teal-6</code>. Palette colors stay fixed when the theme or
      display mode changes. Choose the text color separately and check its contrast.
    </p>
    <QCodeBlock
      language="html"
      code={`<span class="bg-teal-2 text-teal-10 q-pa-sm">
  Riverside route
</span>`}
      copiable />
    <div class="palette-grid q-gap-md q-mt-lg">
      {#each PALETTE_COLORS as color (color)}
        <section class="palette surface-container-low" aria-label={`${color} palette`}>
          <h3 class="title-medium q-pa-md q-ma-none">{color}</h3>
          <div class="q-pb-sm">
            {#each { length: 10 }, index (index)}
              {@const shadeNumber = index + 1}
              <div class="flex no-wrap items-center q-gap-sm q-px-md q-py-xs">
                <span class="palette-swatch bg-{color}-{shadeNumber}" aria-hidden="true"></span>
                <code class="body-small">{color}-{shadeNumber}</code>
              </div>
            {/each}
          </div>
        </section>
      {/each}
    </div>
    <p class="q-mt-lg">
      Building class names at runtime? If you enable CSS stripping, add them to your
      <a class="q-docs-link" href={resolve("/utils/assets")}>CSS safelist</a>.
    </p>
  </section>
</div>

<style>
  code,
  h3 {
    overflow-wrap: anywhere;
  }

  .pickup-card {
    max-width: 640px;
    border-radius: 24px;
  }
  .parcel-icon {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }
  .pickup-status {
    border-radius: 12px;
  }
  .class-reference {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .role-reference {
    padding-inline-start: 24px;
  }
  .palette-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 176px), 1fr));
  }
  .palette {
    border-radius: 20px;
  }
  .palette-swatch {
    flex: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  @media (max-width: 599px) {
    .class-reference {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 8px;
    }
    .class-reference dd:not(:last-child) {
      margin-bottom: 16px;
    }
  }
</style>
