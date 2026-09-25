export async function load() {
  return await Promise.resolve({ title: "Loaded page", description: "Loaded before rendering." });
}
