<script lang="ts">
  import { QDocs, QDocsSection } from "$private";
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
            Dark mode is also persistent accross page reloads and sessions as it uses a cookie to
            store the current state.
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
            of the framework. You can use it to check the current breakpoint and react to changes in
            the viewport size.
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
