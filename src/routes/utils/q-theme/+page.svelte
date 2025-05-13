<script lang="ts">
  import { onDestroy } from "svelte";
  import { QDocs, QDocsSection } from "$private";
  import { QBtn, QCodeBlock, QTheme, Quaff } from "$lib";
  import type { HexValue } from "$utils";
  import { pageTitle } from "$helpers/pageTitle";

  let hexColor = $state("");
  let customPrimary = $state<HexValue>(
    QTheme.themeColors[`primary-${Quaff.darkMode.isActive ? "dark" : "light"}`]
  );

  function getRandomHexColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color as HexValue;
  }

  function changeColors() {
    QTheme.updateThemeColors({
      "primary-light": customPrimary,
      "primary-dark": customPrimary,
    });
  }

  function resetTheme() {
    QTheme.setTheme("#0039b4");
  }

  onDestroy(resetTheme);
</script>

<svelte:head>
  <title>{pageTitle("QTheme")}</title>
</svelte:head>

<QDocs
  docName="QTheme"
  docDescription="The QTheme class allows you to easily manage the color theme of your app."
>
  {#snippet display()}
    <QBtn
      icon="palette"
      label="Random color theme"
      onclick={() => QTheme.setTheme(getRandomHexColor())}
    />
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Color system">
      {#snippet sectionDescription()}
        <p>
          Quaff uses a color system based on Material Design 3, which provides a comprehensive set
          of colors for building beautiful and consistent user interfaces. In Quaff, this system is
          managed with the QTheme class singleton.
        </p>
        <p>
          Material Design 3 uses two sets of CSS variables to define the colors used in your app:
          one for light mode, and one for dark mode.
        </p>
        <p>
          When dark mode is changed, Quaff automatically switches between the color sets to ensure
          that the colors are consistent with the current theme. This means that you can use the
          same color names in your app, regardless of whether the user is in light or dark mode.
        </p>
        <p>
          You can see a list of those colors with the
          <code> QTheme.themeColors </code> reactive property.
        </p>
      {/snippet}

      Current colors theme:
      <QCodeBlock
        code={JSON.stringify(QTheme.themeColors, null, 2)}
        language="json"
        style="max-height: 300px; overflow: auto;"
      />
    </QDocsSection>

    <QDocsSection title="Switching themes">
      {#snippet sectionDescription()}
        <p>
          Material Design 3 provides a very convenient method to create a color theme based on a
          primary color. Quaff provides a method to do this:
          <code> QTheme.setTheme() </code>. This method takes a HEX color as a parameter and
          generates a color theme based on that color. The generated theme is then automatically
          applied to the entire app.
        </p>
        <p>
          It may be important to note that the generated primary color is not the same as the
          provided one, but rather a color that is derived from it.
        </p>
      {/snippet}

      <div class="flex items-center q-gap-md">
        <QBtn label="Generate new HEX color" onclick={() => (hexColor = getRandomHexColor())} />
        {#if hexColor}
          <span
            style="background: {hexColor}; height: 1rem; width: 2rem; border-radius: 5px; border: 1px solid var(--outline)"
          ></span>
          <span>{hexColor}</span>
        {:else}
          <span>No color generated</span>
        {/if}
      </div>

      <div class="flex items-center q-gap-md q-mt-md">
        <QBtn
          icon="palette"
          label="Set color theme"
          onclick={() => QTheme.setTheme(hexColor)}
          disabled={!hexColor}
        />

        {#if hexColor}
          <QCodeBlock language="ts" code="QTheme.setTheme('{hexColor}')" />
        {/if}
      </div>

      <QBtn class="q-mt-md" icon="undo" label="Reset" onclick={resetTheme} />
    </QDocsSection>

    <QDocsSection title="Custom colors">
      {#snippet sectionDescription()}
        <p>
          For fine-tuning the colors of your app, you can use the
          <code> QTheme.updateThemeColor() </code> or <code> QTheme.updateThemeColors() </code> methods.
          These methods allow you to update any of the colors in the theme.
        </p>
        <p>
          <code>QTheme.updateThemeColor</code> takes two parameters: the name of the color to update,
          and the new color.
        </p>
        <p>
          <code>QTheme.updateThemeColors</code> takes an object with the colors to update. The
          object should have the same structure as the <code> QTheme.themeColors </code> object.
        </p>
      {/snippet}

      <div class="flex items-center q-gap-md">
        <QBtn
          label="Generate new HEX color"
          onclick={() => (customPrimary = getRandomHexColor())}
        />
        <span
          style="background: {customPrimary}; height: 1rem; width: 2rem; border-radius: 5px; border: 1px solid var(--outline)"
        ></span>
        <span>{customPrimary}</span>
      </div>

      <div class="flex items-center q-gap-md q-mt-md">
        <QBtn
          icon="palette"
          label="Set primary color"
          onclick={changeColors}
          disabled={!customPrimary}
        />

        <QCodeBlock
          language="ts"
          code={`QTheme.updateThemeColors({ 'primary-light': '${customPrimary}', 'primary-dark': '${customPrimary}' })`}
        />
      </div>

      <QBtn class="q-mt-md" icon="undo" label="Reset" onclick={resetTheme} />
    </QDocsSection>
  {/snippet}
</QDocs>
