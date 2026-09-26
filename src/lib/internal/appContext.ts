import { getAllContexts, onDestroy } from "svelte";
import { browser } from "$app/environment";

let appContext: Map<unknown, unknown> | undefined;

/** Keep programmatically mounted components in the app's context. */
export function captureAppContext() {
  if (!browser) {
    return;
  }

  const context = getAllContexts();
  appContext = context;

  onDestroy(() => {
    if (appContext === context) {
      appContext = undefined;
    }
  });
}

export function getAppContext() {
  return appContext;
}
