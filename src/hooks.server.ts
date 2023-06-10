export async function handle({ event, resolve }) {
  let stored_mode = event.cookies.get("current_mode");

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('class=""', `class="${stored_mode}"`),
  });
  return response;
}
