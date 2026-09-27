export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

const BREAKPOINT_NAMES = ["xs", "sm", "md", "lg", "xl"] as const;

// MD3 window width classes, in CSS pixels on the web.
export const BREAKPOINTS = Object.freeze({ xs: 0, sm: 600, md: 840, lg: 1200, xl: 1600 });

const SCREEN_SIZES = Object.freeze({
  sm: BREAKPOINTS.sm,
  md: BREAKPOINTS.md,
  lg: BREAKPOINTS.lg,
  xl: BREAKPOINTS.xl,
});

export interface ScreenState extends Readonly<Record<Breakpoint, boolean>> {
  /** Whether a viewport or explicit width is available. */
  readonly ready: boolean;
  readonly width: number;
  readonly height: number;
  readonly name: Breakpoint;
  readonly sizes: typeof SCREEN_SIZES;
  /** Below the minimum width of a size class. */
  readonly lt: Readonly<Record<Exclude<Breakpoint, "xs">, boolean>>;
  /** Above an entire size class: gt.md includes lg and xl. */
  readonly gt: Readonly<Record<Exclude<Breakpoint, "xl">, boolean>>;
  /** Recommended navigation: a bar on compact windows, a rail from medium upward. */
  readonly navigation: "navbar" | "railbar";
  /** Whether there is room for the recommended two-pane list/detail layout (expanded and up). */
  readonly twoPane: boolean;
}

export function resolveScreen(width: number | undefined, height?: number): ScreenState {
  const ready = width !== undefined && Number.isFinite(width) && width >= 0;
  const currentWidth = ready ? width : 0;
  let name: Breakpoint = "xs";

  for (const breakpoint of BREAKPOINT_NAMES) {
    if (currentWidth >= BREAKPOINTS[breakpoint]) {
      name = breakpoint;
    }
  }

  const lt = {
    sm: currentWidth < BREAKPOINTS.sm,
    md: currentWidth < BREAKPOINTS.md,
    lg: currentWidth < BREAKPOINTS.lg,
    xl: currentWidth < BREAKPOINTS.xl,
  };

  return {
    ready,
    width: currentWidth,
    height: height !== undefined && Number.isFinite(height) && height >= 0 ? height : 0,
    name,
    sizes: SCREEN_SIZES,
    xs: name === "xs",
    sm: name === "sm",
    md: name === "md",
    lg: name === "lg",
    xl: name === "xl",
    lt,
    gt: { xs: !lt.sm, sm: !lt.md, md: !lt.lg, lg: !lt.xl },
    navigation: lt.sm ? "navbar" : "railbar",
    twoPane: !lt.md,
  };
}
