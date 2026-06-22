// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  namespace Q {
    export type Size = "none" | "xs" | "sm" | "md" | "lg" | "xl";

    export type CssUnit = "px" | "%" | "em" | "ex" | "ch" | "rem" | "vw" | "vh" | "vmin" | "vmax";

    export type CssValue = `${number}${CssUnit}`;

    export type StringWithSuggestions<T extends string> = T | (string & {});

    export interface QComponentDocs {
      name: string;
      description: string;
      docs: {
        props: QComponentProp[];
        slots: QComponentSlot[];
        methods: QComponentMethod[];
        events: QComponentEvent[];
      };
    }

    export interface QComponentProp {
      name: string;
      type: string;
      default?: unknown;
      description: string;
      clickableType?: boolean;
      optional?: boolean;
    }

    export interface QComponentSlot {
      name: string;
      description: string;
    }

    export interface QComponentType {
      name: string;
      description: string;
    }

    export interface QComponentEvent {
      name: string;
      type: string;
      description: string;
    }

    export interface QComponentMethod {
      name: string;
      type: string;
      description: string;
    }

    type ComponentName = `q-${string}`;

    interface QuaffClassesParams {
      bemClasses?: Record<string, unknown>;
      classes?: unknown[];
      isCustomComponent?: boolean;
    }

    /**
     * Function that allows a preprocessor to add static and dynamic classes on the chosen component (identified by `componentName`).
     *
     * @param componentName - Main class of the target element. The element should only have this class to be well targeted. If you need to add other classes, use this function's `classes` parameter.
     * @param bemClasses - Classes that should be prefixed with `componentName`
     * @param classes - Classes that should not be prefixed with `componentName`. Use arrow function if Svelte cries about `$derived` values
     */
    export function classes(
      componentName: string,
      { bemClasses, classes, isCustomComponent }: QuaffClassesParams
    ): {
      class: string;
    };
  }
}

export {};
