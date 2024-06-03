import { watch } from "fs";
import { dirname, resolve as resolvePath } from "path";

type PromiseResolve = (value: void | PromiseLike<void>) => void;
type PromiseWithResolve = Promise<void> & { resolve: PromiseResolve };

function makeResolvablePromise() {
  let resolvePromise: PromiseResolve = () => {};

  const p = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  return Object.assign(p, { resolve: resolvePromise }) as Omit<PromiseWithResolve, "resolve"> & {
    resolve?: PromiseWithResolve["resolve"];
  };
}

const TIMEOUT_MS = 30 * 1000;

export default async function waitForSvelteKit({
  svelteKitPathResolved,
  svelteKitTsconfigPathResolved,
}: {
  svelteKitPathResolved: string;
  svelteKitTsconfigPathResolved: string;
}) {
  const cancelWatcher = new AbortController();
  const promise = makeResolvablePromise();

  const timeout = setTimeout(() => {
    console.warn("timeout reached. this is probably a bug.");
    promise.resolve?.();
  }, TIMEOUT_MS);

  watch(
    dirname(svelteKitPathResolved),
    {
      recursive: true,
      signal: cancelWatcher.signal,
    },
    (eventType, fileName) => {
      if (!fileName?.includes("tsconfig.json")) {
        return;
      }

      const pathResolved = resolvePath(fileName);

      if (pathResolved === svelteKitTsconfigPathResolved) {
        cancelWatcher.abort();

        if (!promise.resolve) {
          throw new Error("expected promise to have a resolve property");
        }

        clearInterval(timeout);
        promise.resolve();
      }
    }
  );

  return await promise;
}
