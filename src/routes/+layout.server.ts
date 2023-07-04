import type { ServerLoadEvent } from "@sveltejs/kit";

export function load({ cookies }: ServerLoadEvent) {
  let theme = cookies.get("current_mode");

  if (theme === undefined) {
    cookies.set("current_mode", "light", {
      path: "/",
      maxAge: 31536000,
      sameSite: "strict",
      httpOnly: false,
    });
    theme = "light";
  }

  return {
    isDark: theme === "dark",
  };
}
