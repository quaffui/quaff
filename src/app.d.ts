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
