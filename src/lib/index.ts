import Quaff from "./classes/Quaff.svelte.js";
import QTheme from "./classes/QTheme.svelte.js";
import QScrollObserver from "./classes/QScrollObserver.svelte";
import Notify from "./classes/Notify.js";

export type { QuaffLanguage, QuaffTranslations } from "./locales/types.js";
export type { QuaffConfig } from "./internal/quaffConfig.js";
export type { QSplitBtnProps } from "./components/split-button/props.js";
export type {
  QBtnGroupProps,
  QBtnToggleOption,
  QBtnToggleProps,
  QBtnToggleValue,
} from "./components/button-group/props.js";
export type { NotifyDefaults, NotifyDismiss, NotifyOptions } from "./classes/Notify.js";
export type {
  QSnackbarAction,
  QSnackbarDismissReason,
  QSnackbarProps,
} from "./components/snackbar/props.js";

// Reexport your entry components here
export * from "$components";

export { Quaff, QTheme, QScrollObserver, Notify };

export { useMeta } from "./composables/useMeta.js";
export type { MetaOptions, MetaSource, MetaTag, QMetaProps } from "./components/meta/props.js";

export type { QSearchProps, QSearchScope, QSearchLabels } from "./components/search/props.js";
