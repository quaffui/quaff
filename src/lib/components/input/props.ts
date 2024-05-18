import type { NativeProps } from "$lib/utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QInputProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  dense?: boolean;
  disable?: boolean;
  error?: boolean;
  errorMessage?: string;
  filled?: boolean;
  hint?: string;
  label?: string;
  outlined?: boolean;
  rounded?: boolean;
  value: string;
  before?: Snippet;
  prepend?: Snippet;
  append?: Snippet;
  after?: Snippet;
}
