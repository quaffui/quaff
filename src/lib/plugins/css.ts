/** @deprecated Import quaffAssets from @quaffui/quaff/plugins/assets. */
export function quaffCss(): never {
  throw new Error(
    "[quaff:assets] quaffCss() was replaced by quaffAssets(). Import it from @quaffui/quaff/plugins/assets. Move dev and safelist into css, and replace prune with css.stripUnused."
  );
}
