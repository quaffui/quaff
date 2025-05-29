<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import { copy } from "$utils";

  let copied = false;
  const npmCommand = "npm create quaff@latest";

  async function copyNpmCommandToClipboard() {
    await copy(npmCommand);
    copied = true;
    setTimeout(() => (copied = false), 600);
  }
</script>

<svelte:head>
  <title>Quaff – Svelte Material 3 UI Framework</title>
</svelte:head>

<div class="q-page page-home">
  <div class="page-home__logo-container">
    <img
      class="page-home__logo"
      src="/logo.svg"
      alt="Quaff logo, a cocktail with a slice of orange"
    />
  </div>
  <div class="page-home__teaser">Quaff is a UI Component Framework built on top of SvelteKit.</div>
  <ul class="page-home__get-started-list">
    <li class="page-home__install">
      <pre class="language-svelte">npm create quaff@latest</pre>
      <QBtn
        icon={copied ? "check" : "copy_all"}
        onclick={copyNpmCommandToClipboard}
        title="Copy to clipboard"
        size="sm"
      />
    </li>
    <li>
      Check our <a href="/components">components</a> and familiarize yourself with our
      <a href="/grid">grid</a>, <a href="/utils">utils</a> and the rest of our docs.
    </li>
    <li>
      Found an issue? <s>Rage</s> Comment on Quaff's
      <a href="https://github.com/quaffui/quaff">GitHub page</a>.
    </li>
  </ul>
</div>

<style lang="scss">
  .page-home {
    padding-top: 0;
    text-align: center;

    &__logo-container {
      text-align: center;
    }

    &__logo {
      max-width: 15.75rem;
      margin: 0 auto;
      margin-top: 10%;
      margin-bottom: 1.75rem;
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

    &__install {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.4em;
    }

    a {
      color: var(--primary);
    }
  }
</style>
