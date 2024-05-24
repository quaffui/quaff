import type { NativeProps } from "$lib/utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QSelectOption = string | { label: string; value: string };

export type QSelectValue = QSelectSingleValue | QSelectMultipleValue;

export type QSelectSingleValue = string | number;

export type QSelectMultipleValue = QSelectSingleValue[];

export interface QSelectProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  value: QSelectValue;
  multiple?: boolean;
  options: QSelectOption[];
  dense?: boolean;
  disable?: boolean;
  error?: boolean;
  errorMessage?: string;
  filled?: boolean;
  hint?: string;
  label?: string;
  outlined?: boolean;
  rounded?: boolean;
  displayValue?: string;
  before?: Snippet;
  prepend?: Snippet;
  append?: Snippet;
  after?: Snippet;
}
