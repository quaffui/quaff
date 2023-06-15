import type { ServerLoadEvent } from "@sveltejs/kit";

export function load({ cookies }: ServerLoadEvent) {
  const theme = cookies.get("current_mode");

  return {
    isDark: theme === "dark",
  };
}
