<script lang="ts">
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QTooltipDocs } from "$components/tooltip/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QCardActions, QCardSection, QIcon, QTooltip } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QTooltipDocs });

  let tooltipRef = $state<QTooltip<string>>();
  let showControlledTooltip = $state(false);
</script>

<svelte:head>
  <title>{pageTitle("QTooltip")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QTooltip>
      {#snippet trigger(props)}
        <QBtn {...props}>Hover me</QBtn>
      {/snippet}

      Simple tooltip
    </QTooltip>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Tooltip">
        {#snippet sectionDescription()}
          QTooltip provides additional information when hovering over an element. By default, it's
          attached to its parent element and appears on hover.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QTooltip>
            {#snippet trigger(props)}
              <QBtn {...props}>Hover me</QBtn>
            {/snippet}

            Simple tooltip
          </QTooltip>

          <QTooltip>
            {#snippet trigger(props)}
              <QBtn icon="help" {...props} />
            {/snippet}

            Help information
          </QTooltip>
        </div>
      </QDocsSection>

      <QDocsSection title="Tooltip Positioning">
        {#snippet sectionDescription()}
          QTooltip can be positioned around its target element using the <code>position</code> prop. Available
          positions are top, right, bottom (default), left, and their corner combinations.
        {/snippet}

        <div class="row q-gutter-md q-ma-sm" style="max-width: 600px;">
          <QTooltip position="top-left">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Top Left</QBtn>
            {/snippet}

            top-left
          </QTooltip>

          <QTooltip position="top">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Top</QBtn>
            {/snippet}

            top
          </QTooltip>

          <QTooltip position="top-right">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Top Right</QBtn>
            {/snippet}

            top-right
          </QTooltip>

          <QTooltip position="left">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Left</QBtn>
            {/snippet}

            left
          </QTooltip>

          <QTooltip>
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Default</QBtn>
            {/snippet}

            default (bottom)
          </QTooltip>

          <QTooltip position="right">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Right</QBtn>
            {/snippet}

            right
          </QTooltip>

          <QTooltip position="bottom-left">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Bottom Left</QBtn>
            {/snippet}

            bottom-left
          </QTooltip>

          <QTooltip position="bottom">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Bottom</QBtn>
            {/snippet}

            bottom
          </QTooltip>

          <QTooltip position="bottom-right">
            {#snippet trigger(props)}
              <QBtn class="col-4" {...props}>Bottom Right</QBtn>
            {/snippet}

            bottom-right
          </QTooltip>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Offset">
        {#snippet sectionDescription()}
          Fine-tune tooltip positioning with the <code>offset</code> prop. This accepts an object
          with <code>x</code> and
          <code>y</code> values to adjust the position in pixels.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QTooltip>
            {#snippet trigger(props)}
              <QBtn {...props}>No offset</QBtn>
            {/snippet}

            Default position
          </QTooltip>

          <QTooltip offset={{ x: 50, y: 10 }}>
            {#snippet trigger(props)}
              <QBtn {...props}>With offset</QBtn>
            {/snippet}

            Offset by 50px horizontally and 10px vertically
          </QTooltip>
        </div>
      </QDocsSection>

      <QDocsSection title="Delay Controls">
        {#snippet sectionDescription()}
          Control the timing of tooltip appearance and disappearance with the <code>delay</code> and
          <code>hideDelay</code> props. These values are specified in milliseconds.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QTooltip delay={0} hideDelay={0}>
            {#snippet trigger(props)}
              <QBtn {...props}>Quick tooltip</QBtn>
            {/snippet}

            Appears and disappears immediately
          </QTooltip>

          <QTooltip delay={500} hideDelay={1000}>
            {#snippet trigger(props)}
              <QBtn {...props}>Delayed tooltip</QBtn>
            {/snippet}

            Takes 0.5s to appear and 1s to disappear
          </QTooltip>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Target">
        {#snippet sectionDescription()}
          By default, tooltips attach to their parent Quaff component. You can specify a different
          target using the <code>target</code> prop with either a DOM element or a CSS selector.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <div class="flex items-center">
            <QBtn id="custom-tooltip-target" class="q-mr-md">Target Button</QBtn>
            <QTooltip target="#custom-tooltip-target">
              This tooltip is attached to the button
            </QTooltip>
            <span>← Hover the button</span>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Rich Content">
        {#snippet sectionDescription()}
          Tooltips can contain rich content, not just text. You can include icons, formatted text,
          and even interactive elements.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QTooltip class="error">
            {#snippet trigger(props)}
              <QBtn icon="info" {...props} />
            {/snippet}

            <div class="flex items-center">
              <QIcon name="warning" class="q-mr-sm" />
              <span>Important information</span>
            </div>
          </QTooltip>

          <QTooltip>
            {#snippet trigger(props)}
              <QBtn {...props}>Rich tooltip</QBtn>
            {/snippet}

            <QCard>
              <QCardSection>
                <h6 class="q-mt-none q-mb-sm">Tooltip Title</h6>
                <p class="q-mb-none">
                  This tooltip contains formatted content with multiple elements.
                </p>
              </QCardSection>
            </QCard>
          </QTooltip>
        </div>
      </QDocsSection>

      <QDocsSection title="Programmatically Controlled">
        {#snippet sectionDescription()}
          Control tooltip visibility programmatically using the <code>value</code> prop with two-way binding.
          This overrides the default hover behavior.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <div class="flex items-center q-gap-md">
            <QTooltip bind:value={showControlledTooltip}>
              {#snippet trigger(props)}
                <QBtn {...props}>My button</QBtn>
              {/snippet}

              This tooltip is controlled programmatically
            </QTooltip>

            <QBtn onclick={() => (showControlledTooltip = !showControlledTooltip)}>
              Toggle tooltip
            </QBtn>
            <div>Tooltip state: {showControlledTooltip ? "visible" : "hidden"}</div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Tooltip Methods">
        {#snippet sectionDescription()}
          QTooltip exposes methods that can be called directly for programmatic control: <code>
            show
          </code>,
          <code>hide</code>, and <code>toggle</code>. Access these methods by binding to the
          component with
          <code>bind:this</code>.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <div class="flex items-center q-gap-md">
            <QBtn id="method-tooltip-target">Method control target</QBtn>
            <QTooltip target="#method-tooltip-target" bind:this={tooltipRef}>
              Controlled with methods
            </QTooltip>
            <div class="flex q-gap-sm">
              <QBtn size="sm" label="Show" onclick={tooltipRef?.show} />
              <QBtn size="sm" label="Hide" onclick={tooltipRef?.hide} />
              <QBtn size="sm" label="Toggle" onclick={tooltipRef?.toggle} />
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Styling Tooltips">
        {#snippet sectionDescription()}
          Tooltips can be styled using standard class properties. This allows you to customize their
          appearance to match your application's design. You can also create rich content tooltips
          using components like <code>QCard</code>.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QTooltip>
            {#snippet trigger(props)}
              <QBtn {...props}>Default style</QBtn>
            {/snippet}

            Default tooltip style
          </QTooltip>

          <QTooltip class="primary">
            {#snippet trigger(props)}
              <QBtn {...props}>Custom style</QBtn>
            {/snippet}

            Custom colored tooltip
          </QTooltip>

          <QTooltip class="q-pa-md">
            {#snippet trigger(props)}
              <QBtn {...props}>Larger tooltip</QBtn>
            {/snippet}

            Tooltip with more padding
          </QTooltip>

          <QTooltip>
            {#snippet trigger(props)}
              <QBtn {...props}>Rich tooltip</QBtn>
            {/snippet}

            <QCard>
              <QCardSection>
                <h6 class="q-mt-none q-mb-sm">Tooltip Title</h6>
                <div>This tooltip contains formatted content with multiple elements.</div>
                <div>
                  It is typically use with <code>QCard</code> to display rich content.
                </div>
              </QCardSection>
              <QCardActions align="right">
                <QBtn flat label="Action 1" />
                <QBtn flat label="Action 2" />
              </QCardActions>
            </QCard>
          </QTooltip>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
