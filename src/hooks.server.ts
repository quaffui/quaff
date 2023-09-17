import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const stored_mode = event.cookies.get("current_mode") || "light";

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('class=""', `class="body--${stored_mode}"`),
  });
  return response;
};
