import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  redirect(308, resolve("/utils/assets/", {}));
};
