<script lang="ts">
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
          Configure framework-wide defaults when initializing Quaff. Expressive styling is off by
          default. Set <code>expressive: true</code> to enable it for supported components; each
          component can override this with <code>{`expressive={true}`}</code> or
          <code>{`expressive={false}`}</code>. The example below reads a Vite environment variable
          in your root layout and passes the resulting boolean to <code>Quaff.init()</code>.
        {/snippet}

        <QCodeBlock
          language="ts"
          code={`Quaff.init({
  expressive: import.meta.env.VITE_QUAFF_EXPRESSIVE === "true",
});`}
        />
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

      <QDocsSection title="Breakpoints">
        {#snippet sectionDescription()}
          <p>
            Quaff provides a simple way to manage breakpoints with its
            <code>breakpoints</code> property. This property is an object that contains the current breakpoints
            of the framework. You can use it to check the current breakpoint and react to changes in the
            viewport size.
          </p>

          <QCodeBlock language="ts" code={JSON.stringify(Quaff.breakpoints, null, 2)} />

          <p>
            It also provides two methods to check if the current viewport is more than or less than
            a given breakpoint: <code>isMoreThan</code> and <code>isLessThan</code>. These methods
            take a breakpoint name and an optional boolean value to determine if the given
            breakpoint should be inclusive. For example, to check if the current viewport is larger
            than <code>md</code> (included), you can use
            <code>Quaff.breakpoints.isMoreThan("md", true)</code>.
          </p>
        {/snippet}
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
