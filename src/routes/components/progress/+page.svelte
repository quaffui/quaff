<script lang="ts">
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QCircularProgressDocs, QLinearProgressDocs } from "$components/progress/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QCircularProgress,
    QLinearProgress,
  } from "$lib";
  import { QDocs, QDocsSection } from "$docs";

  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QLinearProgressDocs, QCircularProgressDocs] });

  let linearValue = 30;
  let circularValue = 25;
  let indeterminateProgress = true;
</script>

<svelte:head>
  <title>{pageTitle("QProgress")}</title>
</svelte:head>

<QDocs
  docName="QProgress"
  docDescription="QProgress provides visual feedback about the progress of a task or operation. It can be used to indicate the completion status of a process, such as file uploads, downloads, or any other time-consuming tasks."
>
  {#snippet display()}
    <QCard class="flex column q-gap-lg" style="width: 75%">
      <QLinearProgress value={75} color="primary" trackColor="secondary" size="0.5rem" />
      <QCircularProgress
        style="align-self: center;"
        value={75}
        color="primary"
        size="4em"
        showValue
      />
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Linear Progress - Basic Usage">
        {#snippet sectionDescription()}
          QLinearProgress displays progress in a horizontal bar. It can represent determinate
          progress with a specific value or indeterminate progress when the duration is unknown.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <QLinearProgress value={linearValue} />
          <div class="flex q-gap-md">
            <QBtn
              size="sm"
              label="Decrease"
              onclick={() => (linearValue = Math.max(0, linearValue - 10))}
            />
            <QBtn
              size="sm"
              label="Increase"
              onclick={() => (linearValue = Math.min(100, linearValue + 10))}
            />
          </div>
          <div>Current value: {linearValue}%</div>
        </div>
      </QDocsSection>

      <QDocsSection title="Indeterminate Linear Progress">
        {#snippet sectionDescription()}
          Use the <code>indeterminate</code> prop when the progress duration is unknown. This displays
          an animated loading state to indicate that an operation is in progress.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <QLinearProgress indeterminate />
          <div>
            <QBtn
              size="sm"
              label="Toggle indeterminate"
              onclick={() => (indeterminateProgress = !indeterminateProgress)}
            />
          </div>

          <div>
            <QLinearProgress value={45} indeterminate={indeterminateProgress} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Expressive Progress">
        {#snippet sectionDescription()}
          Set <code>expressive</code> for wavy Material 3 Expressive indicators. Pass
          <code>{`{ expressive: true }`}</code> to <code>Quaff.init()</code> to enable them globally.
        {/snippet}

        <div class="q-my-md flex column q-gap-lg" style="max-width: 400px;">
          <QLinearProgress value={65} expressive aria-label="Profile setup" />
          <QLinearProgress expressive indeterminate aria-label="Uploading files" />

          <div class="flex items-center q-gap-lg">
            <QCircularProgress value={65} expressive aria-label="Profile setup" />
            <QCircularProgress value={35} expressive aria-label="Download progress" />
            <QCircularProgress expressive indeterminate aria-label="Download progress" />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Linear Progress Colors">
        {#snippet sectionDescription()}
          Customize the appearance of QLinearProgress with the <code>color</code> and
          <code>trackColor</code> props. You can use theme color names or custom CSS color values.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <QLinearProgress value={40} color="primary" />
          <QLinearProgress value={60} color="secondary" />
          <QLinearProgress value={80} color="tertiary" />
          <QLinearProgress value={50} color="error" trackColor="error-container" />
          <QLinearProgress value={70} color="#8E44AD" trackColor="#D7BDE2" />
        </div>
      </QDocsSection>

      <QDocsSection title="Linear Progress Sizes and Shapes">
        {#snippet sectionDescription()}
          Baseline indicators are 4px high and expressive indicators are 10px high. Use the
          <code>size</code> prop for a custom height or <code>noRound</code> for square ends.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <QLinearProgress value={50} />
          <QLinearProgress value={50} expressive />
          <QLinearProgress value={50} size="0.5rem" />
          <QLinearProgress value={50} size="0.5rem" noRound />
        </div>
      </QDocsSection>

      <QDocsSection title="Reversed Linear Progress">
        {#snippet sectionDescription()}
          Use the <code>reverse</code> prop to change the direction of the progress bar from right-to-left.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <div>Default direction (left-to-right):</div>
          <QLinearProgress value={60} />
          <div class="q-mt-sm">Reversed direction (right-to-left):</div>
          <QLinearProgress value={60} reverse />
        </div>
      </QDocsSection>

      <QDocsSection title="Linear Progress with Buffer">
        {#snippet sectionDescription()}
          The <code>buffer</code> prop displays a secondary progress indicator, useful for showing buffered
          content in media players or multi-step operations where some parts are already prepared. If
          the provided buffer is greater than 1, it will be interpreted as a percentage (0-100). Otherwise,
          it will be treated as a fraction (0-1).
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <QLinearProgress value={30} buffer={0.6} />
          <div class="text-caption">Download progress: 30%, Buffered: 60%</div>

          <QLinearProgress value={50} buffer={80} color="secondary" />
          <div class="text-caption">Download progress: 50%, Buffered: 80%</div>
        </div>
      </QDocsSection>

      <QDocsSection title="Linear Progress Animation Control">
        {#snippet sectionDescription()}
          Control animation behavior with the <code>instantFeedback</code> and
          <code>animationSpeed</code> props. This is useful when you need immediate visual feedback or
          custom timing.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 400px;">
          <div>Default animation (600ms):</div>
          <QLinearProgress bind:value={linearValue} />

          <div>Faster animation (200ms):</div>
          <QLinearProgress bind:value={linearValue} animationSpeed={200} />

          <div>Instant feedback (no animation):</div>
          <QLinearProgress bind:value={linearValue} instantFeedback />

          <div class="q-mt-sm">
            <QBtn size="sm" label="Set to 20%" onclick={() => (linearValue = 20)} class="q-mr-sm" />
            <QBtn size="sm" label="Set to 80%" onclick={() => (linearValue = 80)} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress - Basic Usage">
        {#snippet sectionDescription()}
          QCircularProgress displays progress in a circular format. Like its linear counterpart, it
          supports both determinate and indeterminate states.
        {/snippet}

        <div class="q-my-md">
          <div class="flex q-gap-lg">
            <QCircularProgress value={circularValue} />
            <div class="flex column justify-center">
              <div class="flex q-gap-md q-mb-sm">
                <QBtn
                  size="sm"
                  label="Decrease"
                  onclick={() => (circularValue = Math.max(0, circularValue - 10))}
                />
                <QBtn
                  size="sm"
                  label="Increase"
                  onclick={() => (circularValue = Math.min(100, circularValue + 10))}
                />
              </div>
              <div>Current value: {circularValue}%</div>
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Indeterminate Circular Progress">
        {#snippet sectionDescription()}
          Similar to linear progress, use the <code>indeterminate</code> prop to show a continuous animation
          when the progress duration is unknown.
        {/snippet}

        <div class="q-my-md flex q-gap-lg">
          <QCircularProgress indeterminate size="3em" />
          <QCircularProgress indeterminate size="3em" color="secondary" />
          <QCircularProgress indeterminate size="3em" color="tertiary" thickness={0.1} />
          <QCircularProgress indeterminate size="3em" color="error" thickness={0.3} />
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress Colors">
        {#snippet sectionDescription()}
          Customize colors using the <code>color</code> and <code>trackColor</code> props. Use theme colors
          or custom values.
        {/snippet}

        <div class="q-my-md flex q-gap-lg">
          <QCircularProgress value={75} color="primary" />
          <QCircularProgress value={75} color="secondary" />
          <QCircularProgress value={75} color="tertiary" />
          <QCircularProgress value={75} color="error" />
          <QCircularProgress value={75} color="#8E44AD" trackColor="#D7BDE2" />
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress with Value Display">
        {#snippet sectionDescription()}
          Enable the <code>showValue</code> prop to display the current progress value in the center of
          the circle. You can also customize the displayed content using the default slot.
        {/snippet}

        <div class="q-my-md flex q-gap-lg">
          <QCircularProgress value={65} showValue />

          <QCircularProgress value={42} showValue size="4em">
            <div class="text-primary">{42}%</div>
          </QCircularProgress>

          <QCircularProgress value={78} showValue size="5em" fontSize="0.4em">
            <div class="title-small">{78}</div>
          </QCircularProgress>
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress Sizes">
        {#snippet sectionDescription()}
          Adjust the size of the circular progress indicator with the <code>size</code> prop. The value
          can be specified in any valid CSS unit or as a number (which will be interpreted as pixels).
        {/snippet}

        <div class="q-my-md flex items-center q-gap-lg">
          <QCircularProgress value={50} size="1.5em" />
          <QCircularProgress value={50} size="3em" />
          <QCircularProgress value={50} size="4.5em" />
          <QCircularProgress value={50} size="6em" />
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress Thickness">
        {#snippet sectionDescription()}
          Control the thickness of the progress arc with the <code>thickness</code> prop. Values range
          from 0 to 1, representing the proportion of the radius.
        {/snippet}

        <div class="q-my-md flex q-gap-lg">
          <QCircularProgress value={60} thickness={0.1} size="3em" />
          <QCircularProgress value={60} thickness={0.15} size="3em" />
          <QCircularProgress value={60} thickness={0.2} size="3em" />
          <QCircularProgress value={60} thickness={0.3} size="3em" />
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress Angle and Range">
        {#snippet sectionDescription()}
          Customize the starting position of the progress arc with the <code>angle</code> prop and
          set custom minimum and maximum values with <code>min</code> and <code>max</code>.
        {/snippet}

        <div class="q-my-md">
          <div class="flex q-gap-lg">
            <QCard class="flex column items-center q-gap-sm">
              <QCardSection>
                <div class="text-subtitle2">angle: 0° (top)</div>
              </QCardSection>
              <QCircularProgress value={50} angle={0} size="3em" />
            </QCard>

            <QCard class="flex column items-center q-gap-sm">
              <QCardSection>
                <div class="text-subtitle2">angle: 90° (right)</div>
              </QCardSection>
              <QCircularProgress value={50} angle={90} size="3em" />
            </QCard>

            <QCard class="flex column items-center q-gap-sm">
              <QCardSection>
                <div class="text-subtitle2">angle: 180° (bottom)</div>
              </QCardSection>
              <QCircularProgress value={50} angle={180} size="3em" />
            </QCard>

            <QCard class="flex column items-center q-gap-sm">
              <QCardSection>
                <div class="text-subtitle2">angle: 270° (left)</div>
              </QCardSection>
              <QCircularProgress value={50} angle={270} size="3em" />
            </QCard>
          </div>

          <div class="q-mt-lg flex q-gap-lg">
            <QCard class="flex column items-center q-gap-sm">
              <QCardSection>
                <div class="text-subtitle2">Custom range (0-50)</div>
              </QCardSection>
              <QCircularProgress value={25} min={0} max={50} size="3em" showValue />
            </QCard>

            <QCard class="flex column items-center q-gap-sm">
              <QCardSection>
                <div class="text-subtitle2">Custom range (0-200)</div>
              </QCardSection>
              <QCircularProgress value={150} min={0} max={200} size="3em" showValue />
            </QCard>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress Shape Customization">
        {#snippet sectionDescription()}
          Control the appearance of the progress indicator with the <code>noRound</code> prop, which determines
          whether the ends of the progress arc are rounded.
        {/snippet}

        <div class="q-my-md flex q-gap-lg">
          <div class="text-center">
            <div class="text-subtitle2 q-mb-sm">Without <code>noRound</code> (Default)</div>
            <QCircularProgress value={65} size="3em" />
          </div>

          <div class="text-center">
            <div class="text-subtitle2 q-mb-sm">With <code>noRound</code></div>
            <QCircularProgress value={65} size="3em" noRound />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Circular Progress Animation Control">
        {#snippet sectionDescription()}
          Like with linear progress, control animation behavior with <code>instantFeedback</code>
          and
          <code>animationSpeed</code>.
        {/snippet}

        <div class="q-my-md flex column q-gap-md" style="max-width: 600px;">
          <div class="flex q-gap-lg">
            <div class="text-center">
              <div class="text-subtitle2 q-mb-sm">Default (600ms)</div>
              <QCircularProgress bind:value={circularValue} size="3em" />
            </div>

            <div class="text-center">
              <div class="text-subtitle2 q-mb-sm">Fast (200ms)</div>
              <QCircularProgress bind:value={circularValue} size="3em" animationSpeed={200} />
            </div>

            <div class="text-center">
              <div class="text-subtitle2 q-mb-sm">No animation</div>
              <QCircularProgress bind:value={circularValue} size="3em" instantFeedback />
            </div>
          </div>

          <div class="q-mt-sm">
            <QBtn
              size="sm"
              label="Set to 10%"
              onclick={() => (circularValue = 10)}
              class="q-mr-sm"
            />
            <QBtn size="sm" label="Set to 90%" onclick={() => (circularValue = 90)} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Practical Applications">
        {#snippet sectionDescription()}
          Examples of how progress indicators can be used in real-world applications.
        {/snippet}

        <div class="q-my-md flex q-gap-lg">
          <QCard style="width: 18rem;">
            <QCardSection>
              <div class="text-h6">File Upload</div>
              <div class="text-subtitle2">3 of 5 files completed</div>
            </QCardSection>

            <QCardSection class="q-mt-md">
              <QLinearProgress value={60} />
              <div class="flex justify-between q-mt-xs">
                <div class="text-caption">27.5 MB/45.8 MB</div>
                <div class="text-caption">60%</div>
              </div>
            </QCardSection>

            <QCardActions align="right">
              <QBtn flat label="Cancel" />
              <QBtn tonal label="Pause" />
            </QCardActions>
          </QCard>

          <QCard class="flex column justify-center" style="width: 18rem;">
            <div class="flex items-center justify-center q-mb-md">
              <QCircularProgress value={75} size="5em" showValue color="tertiary" />
            </div>
            <div class="text-center text-h6">Battery Status</div>
            <div class="text-center text-subtitle2">Charging - 1h 20m until full</div>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          Add a label that identifies the operation. Determinate indicators expose their current
          value and range; indeterminate indicators omit <code>aria-valuenow</code>.
        {/snippet}

        <div class="q-my-md flex column q-gap-lg" style="max-width: 400px;">
          <QLinearProgress value={35} aria-label="Uploading profile photo" />
          <QCircularProgress indeterminate aria-label="Loading account details" />
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
