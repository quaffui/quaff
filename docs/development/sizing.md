# Sizing and text scaling

Quaff enlarges text while preserving design spacing. Containers grow or adapt when needed. Keep the normal appearance at a 16px root in both standard and expressive modes.

## Unit policy

| Purpose                                        | Use                                                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Font size, line height and tracking            | Existing typography tokens in `rem`.                                                                                                                   |
| Deliberately text-relative dimensions          | `em` for local text relationships; `rem` for root-text relationships, such as monogram avatar minimums and default circular progress with `showValue`. |
| Spacing, icons, shapes, borders and shadows    | CSS pixels at their existing 16px-root measurements. Icon fonts count as geometry.                                                                     |
| Text-bearing controls                          | Intrinsic sizing, nominal minimum dimensions and fixed padding; allow labels to wrap when needed.                                                      |
| Numeric size props and DOM measurements        | CSS pixels, preserving existing API contracts.                                                                                                         |
| SVG, percentages and viewport-relative layouts | Their existing coordinate systems.                                                                                                                     |

- Keep the root default `--size: 1rem` so browser font preferences apply. Root text sizing must not enlarge all built-in spacing. Browser zoom still scales the whole page.
- Keep the spacing utilities and Sass customization points; default spacing is 4/8/16/24/48px. Explicit CSS-length overrides retain their supplied units.
- Preserve at least 48×48 CSS-pixel default icon-button targets, including with smaller text. Visible icon size and interaction area are separate.
- Keep standalone full-round shapes rounded as text containers grow. Connected and split buttons keep corner radii based on their declared size; do not add runtime size tracking solely for rounding.
- Adapt related parts together: labels, borders, accessories, loading states and composed controls. Keep content and actions reachable; avoid fixed heights or clipping that hide enlarged text.
- Keep numeric defaults and breakpoints unchanged unless the task explicitly changes them. For time pickers, measure whether the dial fits and use input fallback; never shrink the dial. Do not let input measurements overwrite cached dial requirements.

## Official guidance

These sources explain the behavior; the unit table above is Quaff's web implementation policy, not a rule that every Material dimension must use pixels.

- [M3 spacing](https://m3.material.io/styles/spacing/applying-spacing): preserve spacing when text enlarges, rather than scaling the entire component uniformly.
- [M3 typography](https://m3.material.io/styles/typography/type-scale-tokens): use `rem` on the web and let text layout accommodate language-dependent line heights.
- [M3 icon-button accessibility](https://m3.material.io/components/icon-buttons/accessibility): retain the default interaction target independently of visible size or density.
- [M3 buttons](https://m3.material.io/components/buttons/specs) and [button groups](https://m3.material.io/components/button-groups/specs): preserve full-round corners as controls grow, including round outer and fixed inner corners in connected groups.
- [M3 time-picker adaptation](https://m3.material.io/components/time-pickers/guidelines): change orientation or use input mode when the dial cannot fit; do not compress its geometry.
- [WCAG text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): preserve content and functionality with enlarged text and narrow viewports. Two-dimensional content such as data tables has specific reflow exceptions.

## Check sizing changes

Compare affected controls at 16px, then browser font sizes of 14, 20, 24 and 32px in Chromium and Firefox. Check zoom and a 320 CSS-pixel viewport, long translations, RTL, keyboard access and scrolling. Include standard/expressive, dense, focused, disabled and loading states where relevant. Verify stable spacing/icons, growing text containers, interaction targets, layout offsets and explicit size overrides. Exercise animations and pointer geometry when changed.
