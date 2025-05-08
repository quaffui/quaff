<script lang="ts">
  import { QInputDocs } from "$components/input/docs";
  import { QBtn, QIcon, QInput } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";

  let defaultValue = $state("Initial Value");
  let outlinedValue = $state("");
  let filledValue = $state("Filled Input");
  let roundedValue = $state("");
  let denseValue = $state("");
  let disabledValue = $state("Cannot edit");
  let errorValue = $state("Invalid data");
  let hintValue = $state("");
  let prependValue = $state("");
  let appendValue = $state("");
  let beforeValue = $state("");
  let afterValue = $state("");
  let combinedValue = $state("");
</script>

<QDocs {snippets} componentDocs={QInputDocs}>
  {#snippet display()}
    <QInput bind:value={defaultValue} label="Standard Input" class="q-mt-md" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          The simplest form of QInput requires a <code>label</code> and a bindable
          <code>value</code>.
        {/snippet}
        <QInput bind:value={defaultValue} label="Standard Input" class="q-mt-md" />
        <p class="text-sm q-mt-sm">Current value: {defaultValue}</p>
      </QDocsSection>

      <QDocsSection title="Input Styles">
        {#snippet sectionDescription()}
          QInput supports several visual styles: <code>outlined</code>, <code>filled</code>, and
          <code>rounded</code>. The default is a standard underline style.
        {/snippet}
        <QInput bind:value={outlinedValue} label="Outlined" class="q-mt-md" outlined />
        <QInput bind:value={filledValue} label="Filled" class="q-mt-md" filled />
        <QInput bind:value={roundedValue} label="Rounded" class="q-mt-md" rounded />
        <p class="text-sm q-mt-sm">Note: Rounded requires outlined or filled.</p>
      </QDocsSection>

      <QDocsSection title="Dense Layout">
        {#snippet sectionDescription()}
          Use the <code>dense</code> prop for a more compact input field, useful in tables or forms with
          limited space.
        {/snippet}
        <QInput bind:value={denseValue} label="Dense Input" class="q-mt-md" dense />
        <QInput bind:value={denseValue} label="Dense Outlined" class="q-mt-md" dense outlined />
        <QInput bind:value={denseValue} label="Dense Filled" class="q-mt-md" dense filled />
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          The <code>disable</code> prop prevents user interaction and visually indicates the input is
          inactive.
        {/snippet}
        <QInput bind:value={disabledValue} label="Disabled Standard" class="q-mt-md" disable />
        <QInput
          bind:value={disabledValue}
          label="Disabled Outlined"
          class="q-mt-md"
          disable
          outlined
        />
        <QInput bind:value={disabledValue} label="Disabled Filled" class="q-mt-md" disable filled />
      </QDocsSection>

      <QDocsSection title="Validation and Hints">
        {#snippet sectionDescription()}
          Provide user guidance with the <code>hint</code> prop. Indicate errors using the
          <code>error</code> prop, optionally displaying a specific <code>errorMessage</code>. The
          error message takes precedence over the hint when <code>error</code> is true.
        {/snippet}
        <QInput
          bind:value={hintValue}
          label="With Hint"
          class="q-mt-md"
          hint="Please enter your username"
        />
        <QInput
          bind:value={errorValue}
          label="Error State"
          class="q-mt-md"
          error
          errorMessage="Username is already taken."
          outlined
        />
        <QInput
          bind:value={errorValue}
          label="Error State with Hint"
          class="q-mt-md"
          error
          hint="This hint is hidden"
          errorMessage="Only the error message shows."
          filled
        />
      </QDocsSection>

      <QDocsSection title="Using Slots for Icons and Content">
        {#snippet sectionDescription()}
          Enhance inputs with icons or other elements using the <code>prepend</code>,
          <code>append</code>,
          <code>before</code>, and <code>after</code> slots. <code>prepend</code> and
          <code>append</code>
          place content inside the input's border, while <code>before</code> and <code>after</code>
          place it outside.
        {/snippet}
        <QInput bind:value={prependValue} label="Prepended Icon" class="q-mt-md" outlined>
          {#snippet prepend()}
            <QIcon name="search" />
          {/snippet}
        </QInput>
        <QInput bind:value={appendValue} label="Appended Icon" class="q-mt-md" filled>
          {#snippet append()}
            <QIcon name="visibility" class="cursor-pointer" />
          {/snippet}
        </QInput>
        <QInput bind:value={beforeValue} label="Before Slot" class="q-mt-md" outlined>
          {#snippet before()}
            <QIcon name="account_circle" size="lg" class="q-mr-sm" />
          {/snippet}
        </QInput>
        <QInput bind:value={afterValue} label="After Slot" class="q-mt-md" filled>
          {#snippet after()}
            <QBtn outlined class="q-ml-sm" onclick={() => alert("Button clicked!")}>Go</QBtn>
          {/snippet}
        </QInput>
        <QInput bind:value={combinedValue} label="Combined Slots" class="q-mt-md" rounded>
          {#snippet prepend()}
            <QIcon name="attach_money" />
          {/snippet}
          {#snippet append()}
            <span class="text-sm">USD</span>
          {/snippet}
        </QInput>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
