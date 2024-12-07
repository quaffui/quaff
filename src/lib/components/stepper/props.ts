import { MaterialSymbol } from "material-symbols";
import { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

/**
 * Used as the symbol for QStepper to pass context to QStep
 */
export const stepperKey = "QStepper";
export const stepsPropsKey = "QStepsProps";

type HTMLDivAttributes = HTMLAttributes<HTMLDivElement>;

export interface QStepperProps extends HTMLDivAttributes {
  /**
   *
   */
  value: string;

  /**
   * @default false
   */
  infinite?: boolean;
  /**
   * @default false
   */
  vertical?: boolean;

  // TODO: Add support for transitions using Svelte transitions
  // /**
  //  * @default undefined
  //  */
  // transitionPrev?: unknown;
  // /**
  //  * @default undefined
  //  */
  // transitionNext?: unknown;
  // /**
  //  * @default 300
  //  */
  // transitionDuration?: unknown;

  /**
   * @default false
   */
  flat?: boolean;
  /**
   * @default false
   */
  bordered?: boolean;
  /**
   * @default false
   */
  alternativeLabels?: boolean;
  /**
   * @default false
   */
  headerNav?: boolean;
  /**
   * @default false
   */
  contracted?: boolean;
  /**
   * @default undefined
   */
  headerClass?: string;

  /**
   * @default undefined
   */
  inactiveColor?: string;
  /**
   * @default undefined
   */
  inactiveIcon?: MaterialSymbol;
  /**
   * @default undefined
   */
  doneIcon?: MaterialSymbol | "none";
  /**
   * @default undefined
   */
  doneColor?: string;
  /**
   * @default undefined
   */
  activeIcon?: MaterialSymbol | "none";
  /**
   * @default undefined
   */
  activeColor?: string;
  /**
   * @default undefined
   */
  errorIcon?: MaterialSymbol | "none";
  /**
   * @default undefined
   */
  errorColor?: string;

  /**
   * @default undefined
   */
  navigation?: Snippet;

  /**
   * @default undefined
   */
  message?: Snippet;
}

export interface QStepProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Name for the panel.
   */
  name: string;

  /**
   * Title for the step.
   */
  title: string;

  /**
   * @default false
   */
  disabled?: boolean;

  /**
   * @default undefined
   */
  icon?: MaterialSymbol;

  /**
   * @default undefined
   */
  color?: string;

  /**
   * @default undefined
   */
  caption?: string;

  /**
   * @default undefined
   */
  prefix?: string;

  /**
   * @default undefined
   */
  doneIcon?: MaterialSymbol | "none";
  /**
   * @default undefined
   */
  doneColor?: string;

  /**
   * @default undefined
   */
  activeIcon?: MaterialSymbol | "none";
  /**
   * @default undefined
   */
  activeColor?: string;

  /**
   * @default undefined
   */
  errorIcon?: MaterialSymbol | "none";
  /**
   * @default undefined
   */
  errorColor?: string;

  /**
   * @default true
   */
  headerNav?: boolean;

  /**
   * @default false
   */
  done?: boolean;

  /**
   * @default false
   */
  error?: boolean;
}

export interface QStepperContext extends QStepperProps, HTMLAttributes<HTMLDivElement> {
  goTo: (name: string) => void; // TODO
  stepperContent: Snippet<[Snippet]>;
}

export interface QStepHeaderProps extends HTMLAttributes<HTMLDivElement> {
  stepper: () => QStepperContext;
  step: QStepProps;
}
