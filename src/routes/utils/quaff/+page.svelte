<script lang="ts">
  import { resolve } from "$app/paths";
  import { QDocs, QDocsSection } from "$docs";
  import { Quaff, QBtn, QChip, QCodeBlock } from "$lib";
  import { pageTitle } from "$helpers/pageTitle";
</script>

<svelte:head>
  <title>{pageTitle("The Quaff class")}</title>
</svelte:head>

<div>
  <QDocs
    docName="The Quaff class"
    docDescription="The Quaff class is the main class of the Quaff framework. It provides methods and properties to manage the framework's state and behavior."
  >
    {#snippet display()}
      <QBtn label="Toggle dark mode" onclick={Quaff.darkMode.toggle} />
    {/snippet}

    {#snippet usage()}
      <QDocsSection title="Configuration">
        {#snippet sectionDescription()}
          Set defaults once in your root layout. Expressive styling is off by default; individual
          components can override it with their <code>expressive</code> prop.
        {/snippet}

        <QCodeBlock language="ts" code={`Quaff.init({ expressive: true });`} />
        <p>
          A plain object works for fixed settings. For runtime changes, pass a <code>$state</code>
          object or getters. This applies to <code>expressive</code>, <code>rtl</code>,
          <code>language</code>, <code>locale</code>, and <code>translations</code>.
        </p>
      </QDocsSection>

      <QDocsSection title="Language">
        {#snippet sectionDescription()}
          <p>
            Import a language pack and pass it to <code>Quaff.init()</code> in your root layout. It
            supplies the UI text for QTable, QDate, QTime, QSelect, and QSearch, along with the
            locale for date and time formatting, the calendar's first weekday, the clock's hour
            cycle, and table sorting. English (<code>en-US</code>) is the default.
          </p>
        {/snippet}

        <QCodeBlock
          language="ts"
          code={`import { Quaff } from "@quaffui/quaff";
import frFR from "@quaffui/quaff/locales/fr-FR";

Quaff.init({ language: frFR });`}
        />

        <p>
          Each pack is a separate import, so unused languages stay out of your bundle. Available BCP
          47 locales are <code>ar-SA</code>, <code>bn-BD</code>, <code>cs-CZ</code>,
          <code>da-DK</code>, <code>de-DE</code>, <code>el-GR</code>, <code>en-US</code>,
          <code>es-ES</code>, <code>fa-IR</code>, <code>fi-FI</code>, <code>fil-PH</code>,
          <code>fr-FR</code>, <code>he-IL</code>, <code>hi-IN</code>, <code>hu-HU</code>,
          <code>id-ID</code>, <code>it-IT</code>, <code>ja-JP</code>, <code>ko-KR</code>,
          <code>mr-IN</code>, <code>ms-MY</code>, <code>nb-NO</code>, <code>nl-NL</code>,
          <code>pl-PL</code>, <code>pt-BR</code>, <code>pt-PT</code>, <code>ro-RO</code>,
          <code>ru-RU</code>, <code>sv-SE</code>, <code>sw-KE</code>, <code>ta-IN</code>,
          <code>te-IN</code>, <code>th-TH</code>, <code>tr-TR</code>, <code>uk-UA</code>,
          <code>ur-PK</code>, <code>vi-VN</code>, <code>zh-CN</code>, and <code>zh-TW</code>.
        </p>
        <p>
          Use <code>locale</code> to override regional formatting, or <code>translations</code>
          for optional wording changes; omitted entries keep the selected pack's text. Existing component
          props such as <code>locale</code>, <code>labels</code>, <code>cancelLabel</code>, and
          <code>noOptionText</code>
          take precedence. Custom packs use the exported
          <code>QuaffLanguage</code> type.
        </p>
        <p>
          For language switching, pass a <code>$state</code> configuration object to
          <code>Quaff.init()</code> once, then update its <code>language</code> property. When
          configuration comes from props, use getters so it stays current. Keep the same initial
          configuration for server rendering and hydration, and set your page's <code>lang</code>
          and <code>dir</code> attributes to match your application.
        </p>
      </QDocsSection>

      <QDocsSection title="Right-to-left layouts">
        {#snippet sectionDescription()}
          Set <code>rtl: true</code> for RTL or <code>false</code> for LTR. Omit it to manage
          direction with HTML <code>dir</code> attributes.
        {/snippet}

        <QCodeBlock language="ts" code={"Quaff.init({ rtl: true });"} />
        <p>
          See <a href={resolve("/utils/rtl", {})}>Right-to-left layouts</a> for setup, local overrides,
          and live examples.
        </p>
      </QDocsSection>

      <QDocsSection title="Framework version">
        {#snippet sectionDescription()}
          You can easily check the current version of the Quaff framework using the <code>
            version
          </code>
          property. This property returns a string with the version number.
        {/snippet}

        <QChip kind="assist" label="v{Quaff.version}" />
      </QDocsSection>

      <QDocsSection title="Dark mode">
        {#snippet sectionDescription()}
          <p>
            The Quaff framework provides a very simple way to manage dark mode with the <code>
              darkMode
            </code>
            property of the Quaff class.
          </p>
          You can check if dark mode is enabled using the
          <code>isActive</code>
          property and manage it using the
          <code>set</code> and <code>toggle</code> methods. The <code>set</code> method sets dark
          mode according to the given boolean value and the
          <code>toggle</code> method toggles dark mode.

          <p>
            Dark mode is also persistent across page reloads and sessions as it stores the current
            display mode in local storage.
          </p>
        {/snippet}

        <div class="flex items-center q-gap-md">
          <QChip
            kind="assist"
            icon={Quaff.darkMode.isActive ? "dark_mode" : "light_mode"}
            label="Dark mode is {Quaff.darkMode.isActive ? 'enabled' : 'disabled'}"
          />

          <QBtn label="Toggle dark mode" onclick={Quaff.darkMode.toggle} />
        </div>
      </QDocsSection>

      <QDocsSection title="Screen">
        {#snippet sectionDescription()}
          <p>
            <code>Quaff.screen</code> provides reactive, read-only viewport dimensions and size
            flags using MD3 boundaries: 600/840/1200/1600px. Call <code>Quaff.init()</code> once
            during root layout setup, including in client-only apps. Read screen properties directly
            in markup or inside <code>$derived</code>.
          </p>
        {/snippet}

        <QCodeBlock
          language="ts"
          code={`Quaff.screen.width;      // Viewport width in CSS pixels
Quaff.screen.height;     // Viewport height in CSS pixels
Quaff.screen.name;       // "xs" | "sm" | "md" | "lg" | "xl"
Quaff.screen.sizes;      // { sm: 600, md: 840, lg: 1200, xl: 1600 }
Quaff.screen.md;         // Only md: 840px up to, but excluding, 1200px
Quaff.screen.lt.md;      // Below md: less than 840px
Quaff.screen.gt.md;      // Above md: at least 1200px
Quaff.screen.ready;      // Whether viewport measurements are available
Quaff.screen.navigation; // "navbar" below 600px, otherwise "railbar"
Quaff.screen.twoPane;    // true from 840px

const expanded = $derived(!Quaff.screen.lt.md); // md or wider: at least 840px`}
        />
        <p>
          The <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, and
          <code>xl</code> flags each match exactly one size class. <code>lt</code> supports
          <code>sm/md/lg/xl</code>; <code>gt</code> supports <code>xs/sm/md/lg</code>.
          <code>gt.md</code> means above the entire md class; <code>!lt.md</code> includes md from 840px.
        </p>
        <p>
          Until the root layout mounts, width and height are <code>0</code>, <code>name</code> is
          <code>"xs"</code>, and <code>ready</code> is false. Live viewport updates begin on mount. This
          keeps the initial server render and hydration consistent.
        </p>
        <p>
          <code>Quaff.getScreen(width, height?)</code> returns a <code>ScreenState</code> with the
          same properties for a container; height defaults to <code>0</code>. It is pure and needs
          no <code>Quaff.init()</code>. Derive it from a measured width with <code>$derived</code>.
          A valid width, including <code>0</code>, makes
          <code>ready</code> true; undefined or invalid widths leave it false. See
          <a class="q-docs-link" href={resolve("/layout/adaptive", {})}>adaptive layouts</a>
          for container sizing, navigation, and list/detail examples.
        </p>
      </QDocsSection>

      <QDocsSection title="Migrating from breakpoints">
        {#snippet sectionDescription()}
          <p>
            <code>Quaff.screen</code> replaces <code>Quaff.breakpoints</code>. Initialize it with
            <code>Quaff.init()</code> in your root layout. The md/lg/xl thresholds also change from 960/1280/1920px
            to 840/1200/1600px; sm stays at 600px.
          </p>
        {/snippet}

        <QCodeBlock
          language="ts"
          code={`const screen = $derived(Quaff.screen);

screen.width;                         // Was breakpoints.currentWidth
screen.name;                          // Was breakpoints.current
screen.sizes.md;                      // Was breakpoints.md (now 840px)

// Comparisons using the new thresholds, once screen.ready is true:
!screen.lt.md;                         // Was isMoreThan("md", true)
screen.width > screen.sizes.md;        // Was isMoreThan("md")
screen.lt.sm;                         // Was isLessThan("sm")
screen.width <= screen.sizes.sm;       // Was isLessThan("sm", true)`}
        />
        <p>
          The old methods compared against a class's starting width. <code>screen.gt.md</code>
          instead means above the whole md class, starting at 1200px. To keep comparisons false before
          mounting, guard them with <code>screen.ready</code>, for example
          <code>screen.ready && screen.lt.sm</code>.
        </p>
      </QDocsSection>

      <QDocsSection title="Sveltekit router">
        {#snippet sectionDescription()}
          <p>
            Quaff provides a handle to Sveltekit's <code>page</code> state with its
            <code>router</code> property. This allows you to easily access and react to route changes
            or query parameters. Here's what it looks like for the current page:
          </p>

          <QCodeBlock language="ts" code={JSON.stringify(Quaff.router, null, 2)} />
        {/snippet}
      </QDocsSection>
    {/snippet}
  </QDocs>
</div>
