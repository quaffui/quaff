// Mark dialog clicks instead of stopping them, so routers and app listeners still receive them.
const dialogClicks = new WeakSet<Event>();

export function markDialogClick(event: Event) {
  dialogClicks.add(event);
}

export function isDialogClick(event: Event) {
  return dialogClicks.has(event);
}
