<script lang="ts">
  import { assets, base } from "$app/paths";
</script>

<svelte:head>
  <title>Quaff – Svelte Material 3 UI Framework</title>
</svelte:head>

<div class="q-page page-home">
  <div class="page-home__logo-container">
    <img
      class="page-home__logo"
      src="{assets}/logo.svg"
      alt="Quaff logo, a cocktail with a slice of orange"
    />
  </div>
  <div class="page-home__teaser">Quaff UI is a Component Framework built on top of SvelteKit.</div>
  <ul class="page-home__get-started-list">
    <li>
      <pre class="language-svelte">npm create quaff@latest</pre>
    </li>
    <li>
      Check our <a href="{base}/components">components</a> and familiarize yourself with our
      <a href="{base}/grid">grid</a>, <a href="{base}/utils">utils</a> and the rest of our docs.
    </li>
    <li>
      Found an issue? <s>Rage</s> Comment on Quaff's
      <a href="https://github.com/quaffui/quaff">GitHub page</a>.
    </li>
  </ul>
</div>

<style lang="scss">
  .page-home {
    padding: 0;
    text-align: center;

    &__logo-container {
      text-align: center;
    }

    &__logo {
      max-width: 15.75rem;
      margin: 0 auto;
      margin-bottom: 1.75rem;
      margin-top: 1.5rem;
    }

    &__teaser {
      font-size: 1.4em;
    }

    &__get-started-list {
      margin-top: 3em;
      list-style-type: none;

      li {
        &:before {
          content: "★ ";
          color: goldenrod;
        }

        &:first-child {
          margin-bottom: 1.5em;

          &:before {
            content: "";
          }
        }

        margin: 1em 0;
      }
    }

    a {
      color: var(--primary);
    }
  }
</style>
