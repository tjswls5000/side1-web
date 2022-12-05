import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { logout } from "~/services/auth/auth.server"

export const action: ActionFunction = async ({ request }) => {
  console.log("logout.tsx action");
  
  return logout(request);
};

export const loader: LoaderFunction = async () => {
    console.log("logout.tsx loader");

  return redirect("/");
};
