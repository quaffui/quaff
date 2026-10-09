import { FontAssetStore } from "./fontAssetStore.js";
import { IconFontStylesheet, type FontSourceUsage } from "./iconFontStylesheet.js";
import { createRobotoStylesheet } from "./robotoStylesheet.js";
import type { QuaffFontsOptions } from "../assetOptions.js";
import type { ResolvedConfig } from "vite";

export class FontStylesheet {
  readonly assets: FontAssetStore;
  readonly needsUsage: boolean;
  private readonly icons: IconFontStylesheet | undefined;
  private roboto: Promise<string> | undefined;

  constructor(
    config: Pick<ResolvedConfig, "root" | "cacheDir">,
    private readonly options: QuaffFontsOptions
  ) {
    this.assets = new FontAssetStore(config);
    this.needsUsage = !!(options.icons && options.icons.stripUnused);
    this.icons =
      options.icons === false
        ? undefined
        : new IconFontStylesheet(this.assets, options.icons ?? {});
  }

  async getStylesheet(usage?: FontSourceUsage) {
    const roboto = await this.getRobotoStylesheet();
    const icons = (await this.icons?.getStylesheet(usage)) ?? "";

    return [roboto, icons, ""].join("\n");
  }

  private async getRobotoStylesheet() {
    try {
      this.roboto ??= createRobotoStylesheet(this.assets, this.options.roboto);

      return await this.roboto;
    } catch (error) {
      this.roboto = undefined;

      throw error;
    }
  }
}
