import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  let stored_mode = event.cookies.get("current_mode");

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('class=""', `class="${stored_mode}"`),
  });
  return response;
};
