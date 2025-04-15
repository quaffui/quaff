<script lang="ts">
  import { QTooltip, QBtn, QCard, QCardSection, QIcon } from "$lib";
  import { QTooltipDocs } from "$components/tooltip/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
  import QCardActions from "$components/card/QCardActions.svelte";

  let tooltipRef = $state<QTooltip<string>>();
  let showControlledTooltip = $state(false);
</script>

<QDocs {snippets} componentDocs={QTooltipDocs}>
  {#snippet display()}
    <QBtn>
      Hover me
      <QTooltip>Simple tooltip</QTooltip>
    </QBtn>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Tooltip">
        {#snippet sectionDescription()}
          QTooltip provides additional information when hovering over an element. By default, it's
          attached to its parent element and appears on hover.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QBtn>
            Hover me
            <QTooltip>Simple tooltip</QTooltip>
          </QBtn>

          <QBtn icon="help">
            <QTooltip>Help information</QTooltip>
          </QBtn>
        </div>
      </QDocsSection>

      <QDocsSection title="Tooltip Positioning">
        {#snippet sectionDescription()}
          QTooltip can be positioned around its target element using the <code>position</code> prop.
          Available positions are top, right, bottom (default), left, and their corner combinations.
        {/snippet}

        <div class="row q-gutter-md q-ma-sm" style="max-width: 600px;">
          <QBtn class="col-4">
            Top Left
            <QTooltip position="top-left">top-left</QTooltip>
          </QBtn>

          <QBtn class="col-4">
            Top
            <QTooltip position="top">top</QTooltip>
          </QBtn>

          <QBtn class="col-4">
            Top Right
            <QTooltip position="top-right">top-right</QTooltip>
          </QBtn>
          <QBtn class="col-4">
            Left
            <QTooltip position="left">left</QTooltip>
          </QBtn>

          <QBtn class="col-4">
            Default
            <QTooltip>default (bottom)</QTooltip>
          </QBtn>

          <QBtn class="col-4">
            Right
            <QTooltip position="right">right</QTooltip>
          </QBtn>
          <QBtn class="col-4">
            Bottom Left
            <QTooltip position="bottom-left">bottom-left</QTooltip>
          </QBtn>

          <QBtn class="col-4">
            Bottom
            <QTooltip position="bottom">bottom</QTooltip>
          </QBtn>

          <QBtn class="col-4">
            Bottom Right
            <QTooltip position="bottom-right">bottom-right</QTooltip>
          </QBtn>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Offset">
        {#snippet sectionDescription()}
          Fine-tune tooltip positioning with the <code>offset</code> prop. This accepts an object
          with <code>x</code> and
          <code>y</code> values to adjust the position in pixels.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QBtn>
            No offset
            <QTooltip>Default position</QTooltip>
          </QBtn>

          <QBtn>
            With offset
            <QTooltip offset={{ x: 50, y: 10 }}>
              Offset by 50px horizontally and 10px vertically
            </QTooltip>
          </QBtn>
        </div>
      </QDocsSection>

      <QDocsSection title="Delay Controls">
        {#snippet sectionDescription()}
          Control the timing of tooltip appearance and disappearance with the <code>delay</code> and
          <code>hideDelay</code> props. These values are specified in milliseconds.
        {/snippet}

        <div class="flex q-gap-md q-ma-sm">
          <QBtn>
            Quick tooltip
            <QTooltip delay={0} hideDelay={0}>Appears and disappears immediately</QTooltip>
          </QBtn>

          <QBtn>
            Delayed tooltip
            <QTooltip delay={500} hideDelay={1000}
              >Takes 0.5s to appear and 1s to disappear</QTooltip
            >
          </QBtn>
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
          <QBtn icon="info">
            <QTooltip>
              <div class="flex items-center">
                <QIcon name="warning" class="q-mr-sm" color="error" />
                <span>Important information</span>
              </div>
            </QTooltip>
          </QBtn>

          <QBtn>
            Rich tooltip
            <QTooltip>
              <QCard style="width: 250px; margin: 0; padding: 0;">
                <QCardSection>
                  <h6 class="q-mt-none q-mb-sm">Tooltip Title</h6>
                  <p class="q-mb-none">
                    This tooltip contains formatted content with multiple elements.
                  </p>
                </QCardSection>
              </QCard>
            </QTooltip>
          </QBtn>
        </div>
      </QDocsSection>

      <QDocsSection title="Programmatically Controlled">
        {#snippet sectionDescription()}
          Control tooltip visibility programmatically using the <code>value</code> prop with two-way
          binding. This overrides the default hover behavior.
        {/snippet}

        <div class="flex flex-col q-gap-md q-ma-sm">
          <div class="flex items-center q-gap-md">
            <QBtn>
              My button
              <QTooltip bind:value={showControlledTooltip}>
                This tooltip is controlled programmatically
              </QTooltip>
            </QBtn>
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
          <QBtn>
            Default style
            <QTooltip>Default tooltip style</QTooltip>
          </QBtn>

          <QBtn>
            Custom style
            <QTooltip class="primary">Custom colored tooltip</QTooltip>
          </QBtn>

          <QBtn>
            Larger tooltip
            <QTooltip class="q-pa-md">Tooltip with more padding</QTooltip>
          </QBtn>

          <QBtn>
            Rich tooltip
            <QTooltip position="top">
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
          </QBtn>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
