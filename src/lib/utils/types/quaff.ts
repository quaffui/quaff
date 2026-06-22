export type QSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export type QEvent<T extends Event, E extends Element> = T & {
  currentTarget: EventTarget & E;
};
