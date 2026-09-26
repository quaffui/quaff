# Typography

Quaff provides 15 baseline styles and 15 opt-in emphasized styles. Add `-emphasized` to a role such as `headline-medium`, `body-large`, or `label-small`. Both sets ship in `base.css` and `index.css`.

```html
<h2 class="headline-medium-emphasized">Your next adventure</h2>
<p class="body-large">Choose a destination and start planning.</p>
<span class="label-large-emphasized">Selected</span>
```

Each style exposes `--typescale-<role>-emphasized-` tokens for `font-family-name`, `font-family-style`, `font-weight`, `font-size`, `line-height`, and `letter-spacing`. For example: `--typescale-body-large-emphasized-font-weight`.

Apply the class to the element that styles the text. Emphasized utilities live in `Quaff.classes`, so they can override component typography when explicitly applied.

Internal component Sass can use `@include mixins.typography("body-large-emphasized")`. Public apps use the CSS classes or tokens.

## Values

These are the public (`3P`), `Web`, `Static` Roboto values in [M3's typography token data](https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TYPOGRAPHY.20543ce18892f7d9.json). The token browser may initially show different, Google Sans (`1P`) values.

Sizes, line heights, and tracking below are CSS pixels at a 16px root. Quaff stores them in `rem`, following its [sizing policy](sizing.md).

| Role            | Size | Line height | Tracking | Emphasized weight |
| --------------- | ---: | ----------: | -------: | ----------------: |
| display-large   |   57 |          64 |    -0.25 |               500 |
| display-medium  |   45 |          52 |        0 |               500 |
| display-small   |   36 |          44 |        0 |               500 |
| headline-large  |   32 |          40 |        0 |               500 |
| headline-medium |   28 |          36 |        0 |               500 |
| headline-small  |   24 |          32 |        0 |               500 |
| title-large     |   22 |          28 |        0 |               500 |
| title-medium    |   16 |          24 |     0.15 |               700 |
| title-small     |   14 |          20 |      0.1 |               700 |
| body-large      |   16 |          24 |      0.5 |               500 |
| body-medium     |   14 |          20 |     0.25 |               500 |
| body-small      |   12 |          16 |      0.4 |               500 |
| label-large     |   14 |          20 |      0.1 |               700 |
| label-medium    |   12 |          16 |      0.5 |               700 |
| label-small     |   11 |          16 |      0.5 |               700 |

## Rules

- Use emphasis for selected states, important actions, or editorial hierarchy. M3 defines a matching emphasized style for each baseline role. [Emphasized type styles](https://m3.material.io/styles/typography/type-scale-tokens#0429784f-5344-4a4a-a482-3a902918d4b1).
- Keep component defaults, headings, and legacy aliases on their baseline styles. Global expressive mode does not enable emphasis. [Component usage](https://m3.material.io/styles/typography/type-scale-tokens#41791031-123a-4ab8-9937-923e420128de).
- Keep the existing brand/plain font tokens. The static styles use weights already loaded by Quaff; variable-font axes are not required.
- Convert dimensions by dividing by 16. This matches [Material Web's generated typography tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss#L208-L211), including tracking.

`src/lib/css/theme/_typography-scale.scss` is the source for tokens, utilities, and the internal mixin. The Sass contract tests check all 15 emphasized styles and preserve baseline defaults.
