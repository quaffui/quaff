# RTL and bidirectional layouts

Use this reference when changing direction-sensitive components. Material guidance describes the intended behavior; the web standards define how to implement it.

## Material 3 rules

- Place primary navigation on the leading edge: left in LTR, right in RTL. Mirror related layout offsets and side transitions. [Navigation rails](https://m3.material.io/foundations/layout/bidirectionality-rtl#1c424533-c4ca-4984-a667-3bfbea2d9a5e), [expanded rails](https://m3.material.io/foundations/layout/bidirectionality-rtl#51a4ea08-5230-4f11-bac9-74494a6ebdb0).
- Mirror directional actions, such as previous/next arrows. Do not flip arbitrary images, logos, or every icon. [Icons and symbols](https://m3.material.io/foundations/layout/bidirectionality-rtl#9081544b-d0a3-44b6-b7c2-e9531555e566).
- Match text alignment and flow to its direction. A popup must retain its content's direction after moving outside its original DOM parent. [Text rendering](https://m3.material.io/foundations/layout/bidirectionality-rtl#ef4a1a93-30df-4c07-ab6f-e1cdc3e9c254).
- Mirror directional swipes and navigation. [Swipe gestures](https://m3.material.io/foundations/layout/bidirectionality-rtl#a24b26a2-4291-4ba5-b4ce-09cdecab15da).
- Linear progress normally fills from the right in RTL. Hebrew progress remains LTR. Circular indicators keep their rotation. [Time](https://m3.material.io/foundations/layout/bidirectionality-rtl#72091a94-c8c6-43de-b47b-d282c636a039).
- Media controls remain LTR. Clocks remain clockwise; their surrounding controls may mirror, including AM/PM placement. [Media players](https://m3.material.io/foundations/layout/bidirectionality-rtl#572896f2-0de1-443a-a8f3-aad0e5168c97), [clocks](https://m3.material.io/foundations/layout/bidirectionality-rtl#fa6e2660-0c6f-4927-9299-981455be9d76).

## Web standards

- Use HTML `dir="ltr"`, `dir="rtl"`, or `dir="auto"`. Direction is inherited; local overrides can differ from the page. `auto` derives direction from content. A language declaration alone does not set direction. [HTML directionality](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute).
- Set `lang` independently, such as `lang="ar"` or `lang="he"`. Language is inherited and can also be overridden locally. [HTML language](https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes).
- Prefer logical CSS properties (`inset-inline-start`, `padding-inline-end`, `text-align: start`) for reading-order geometry. Physical `left`/`right` remain useful for deliberate fixed placement. [CSS logical properties](https://www.w3.org/TR/css-logical-1/).
- Let the browser resolve inherited direction and language through `:dir()` and `:lang()` where CSS is sufficient. Moving a node changes its inheritance context. Preserve resolved direction explicitly for portalled content, honoring a caller's override. [Direction selector](https://www.w3.org/TR/selectors-4/#the-dir-pseudo), [language selector](https://www.w3.org/TR/selectors-4/#the-lang-pseudo).

## Quaff implementation policy

- Logical navigation sides and menu anchors follow the component's direction. Explicit physical sides remain physical.
- Layout offsets, drawer corners, hiding transforms, and swipe edges must agree with the visible side.
- Popups use their trigger's resolved direction unless explicitly overridden. Cover both body portals and overlays inside dialogs, including nested LTR content in RTL pages.
- Prefer CSS for layout. `Quaff.init({ rtl })` supplies reactive app direction; emit matching HTML `dir` for the first server render. Popups read local direction and language when opened. For live local changes, pass reactive `dir`/`lang` props. Do not observe DOM mutations to infer app state. Menu alignment uses CSS percentages so content can resize without a size observer.
- `reverse` reverses a progress bar's normal language-aware fill direction. Explicit `dir="ltr"` can be used for media progress inside RTL content.

## Focused checks

Use existing Vitest conventions: `.test.ts` for unit tests and `.int.test.ts` for integrations. Test actual DOM behavior when direction inheritance or mounting matters; use the small browser integration fixture for CSS geometry, portals, and gestures. It runs in Vitest with Playwright’s Chromium library, not a separate E2E runner. Install the browser once with `bunx playwright install chromium --only-shell`, then run `bun run test:unit --run src/tests/rtl`. CI installs the same headless browser.

Cover LTR, Arabic RTL, Hebrew RTL, nested opposite directions, direction changes, explicit overrides, popup opening, drawer edges and offsets, and table navigation. Keep the existing RTL keyboard behavior in tabs, sliders, carousels, and date/time pickers. See [Sizing and text scaling](sizing.md) when geometry changes.
