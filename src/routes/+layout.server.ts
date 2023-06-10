export function load({ cookies }) {
  const theme = cookies.get("current_mode");

  return {
    isDark: theme === "dark",
  };
}
