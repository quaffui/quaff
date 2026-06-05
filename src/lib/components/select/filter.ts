import { getOptionLabel } from "./option";
import type { QSelectOption, QSelectProps } from "./props";

type QSelectOnFilter = QSelectProps["onFilter"];

type FilterRunnerOptions = {
  onAbort: () => void;
  onDone: () => void | Promise<void>;
};

export function getFilteredOptions(
  options: QSelectOption[],
  search: string,
  useInput: boolean,
  filterable: boolean,
  hasExternalFilter: boolean
) {
  if (!useInput || !filterable || hasExternalFilter) {
    return options;
  }

  const query = search.trim().toLowerCase();

  if (!query) {
    return options;
  }

  return options.filter((option) =>
    String(getOptionLabel(option, options)).toLowerCase().includes(query)
  );
}

export function getInputValue(
  currentDisplayValue: string | number,
  search: string,
  useInput: boolean,
  isSearching: boolean
) {
  return useInput && isSearching ? search : currentDisplayValue;
}

export function createFilterRunner({ onAbort, onDone }: FilterRunnerOptions) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let run = 0;

  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    run += 1;
  }

  function schedule(search: string, onFilter: QSelectOnFilter, debounce = 0) {
    clear();

    if (!onFilter) {
      return;
    }

    const currentRun = run;

    if (debounce > 0) {
      timer = setTimeout(() => {
        timer = undefined;
        runFilter(search, onFilter, currentRun);
      }, debounce);
      return;
    }

    runFilter(search, onFilter, currentRun);
  }

  function runFilter(search: string, onFilter: NonNullable<QSelectOnFilter>, currentRun: number) {
    let aborted = false;

    const update = (callbackFn: () => void | Promise<void>) => {
      try {
        void Promise.resolve(callbackFn())
          .then(() => {
            if (!aborted && currentRun === run) {
              void onDone();
            }
          })
          .catch(abort);
      } catch {
        abort();
      }
    };

    const abort = () => {
      if (aborted) {
        return;
      }
      aborted = true;
      if (currentRun === run) {
        onAbort();
      }
    };

    try {
      void Promise.resolve(onFilter(search, update, abort)).catch(abort);
    } catch {
      abort();
    }
  }

  return { clear, schedule };
}
