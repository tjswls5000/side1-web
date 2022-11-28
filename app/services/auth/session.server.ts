import { User } from "@prisma/client";
import { createCookieSessionStorage, redirect, Session } from "@remix-run/node";

import { IS_PRODUCTION } from "~/lib/config"
import { SESSION_SECRET } from "~/lib/config.server"
import { db } from "~/lib/db.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "RJ_auth_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: IS_PRODUCTION,
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 365 days
    httpOnly: true,
  },
});

export async function createAuthSession(
  accessToken: string,
  refreshToken: string,
  redirectTo: string
) {
  const session = await authSessionStorage.getSession();
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(session),
    },
  });
}

export function setAuthSession(
  session: Session,
  accessToken: string,
  refreshToken: string
): Session {
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);

  return session;
}
