import type { Prisma, User } from "@prisma/client"
import { createCookieSessionStorage, redirect } from "@remix-run/node"

import { IS_PRODUCTION } from "~/lib/config"
import { SESSION_SECRET } from "~/lib/config.server"
import { db } from "~/lib/db.server"
import { createToken, decryptToken } from "~/lib/jwt"

import { sendPasswordChangedEmail, sendResetPasswordEmail } from "../user/user.mailer.server"
import { comparePasswords, hashPassword } from "./password.server"
import { authSessionStorage } from "./session.server"

export async function sendResetPasswordLink({ email }: { email: string }) {
  const user = await db.user.findUnique({ where: { email } })
  if (user) {
    const token = createToken({ id: user.id })
    await sendResetPasswordEmail(user, token)
  }
  return true
}

export async function resetPassword({ token, password }: { token: string; password: string }) {
  try {
    const payload = decryptToken<{ id: number }>(token)
    const hashedPassword = await hashPassword(password)
    const user = await db.user.update({ where: { id: payload.id }, data: { password: hashedPassword } })
    await sendPasswordChangedEmail(user)
    return true
  } catch (error) {
    return false
  }
}

// export async function register(data: Prisma.UserCreateInput) {
//   const email = data.email.toLowerCase().trim()
//   const existing = await db.user.findFirst({ where: { email } })
//   if (existing) return { error: "User with these details already exists" }
//   const password = await hashPassword(data.password)
//   const join_date = db.Date()

//   const user = await db.user.create({ data: { ...data, join_date, is_active, is_seller, signup_method_id, password } })

//   return { user }
// }

// const storage = createCookieSessionStorage({
//   cookie: {
//     name: "boilerplate_session",
//     secure: IS_PRODUCTION,
//     secrets: [SESSION_SECRET],
//     sameSite: "lax",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 30,
//     httpOnly: true,
//   },
// })

// export async function createUserSession(userId: number, redirectTo: string) {
//   const session = await storage.getSession()
//   session.set("userId", userId)
//   return redirect(redirectTo, {
//     headers: {
//       "Set-Cookie": await storage.commitSession(session),
//     },
//   })
// }

// export async function getUserIdFromSession(request: Request) {
//   const session = await storage.getSession(request.headers.get("Cookie"))
//   const userId = session.get("userId")
//   if (!userId || typeof userId !== "number") return null
//   return userId
// }

// const getSafeUser = async (id: number) => {
//   const user = await db.user.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//     },
//   })
//   if (!user) return null
//   return user
// }

// export async function getUser(request: Request) {
//   const id = await getUserIdFromSession(request)
//   if (!id) return null
//   try {
//     return await getSafeUser(id)
//   } catch {
//     return null
//   }
// }

// export type CurrentUser = Omit<User, "password">
// export type CurrentUserJson = Omit<User, "password" | "createdAt" | "updatedAt"> & {
//   createdAt: string
//   updatedAt: string
// }

// export async function getCurrentUser(request: Request) {
//   const id = await getUserIdFromSession(request)
//   if (!id) throw logout(request)
//   try {
//     const user = await getSafeUser(id)
//     if (!user) throw logout(request)
//     return user
//   } catch {
//     throw logout(request)
//   }
// }

// export async function requireUser(request: Request, redirectTo: string = new URL(request.url).pathname) {
//   const id = await getUserIdFromSession(request)
//   if (!id) {
//     const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
//     throw redirect(`/login?${searchParams}`)
//   }
// }

// export async function logout(request: Request) {
//   const session = await storage.getSession(request.headers.get("Cookie"))
//   return redirect("/", {
//     headers: {
//       "Set-Cookie": await storage.destroySession(session),
//     },
//   })
// }


type LoginForm = {
  email: string;
  password: string;
  is_seller: number
};

type RegisterForm = {
  email: string
  password: string
  name: string
  address: string
}

type AuthData = {
  accessToken: string;
  refreshToken: string;
};

type RegisterResponse = {
  tokens?: AuthData;
  error?: string;
};

export async function register({
  email,
  password,
  name,
  address
}: RegisterForm): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name, address, signup_method: 1, is_seller: 1 }),
    });

    if (response.ok) {
      const data = await response.json();
      const { accessToken, refreshToken } = data;
      if (!accessToken || !refreshToken) {
        return { error: "No tokens returned from server" };
      }
      return { tokens: { accessToken, refreshToken } };
    } else {
      const json = await response.json();
      return { error: json.message };
    }
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
}

export async function login({ email, password, is_seller }: LoginForm) {
  try {
    console.log("body", JSON.stringify({ email, password, is_seller }));
    
    const response = await fetch(`http://54.180.145.47:10000/user/login`, {// ${process.env.API_URL}:10000/user/login
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, is_seller }),
    });

    const data = await response.json();
    const { accessToken, refreshToken } = data;

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function logout(request: Request) {
  console.log("logout");
  
  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return redirect("/login", {
    headers: {
      "Set-Cookie": await authSessionStorage.destroySession(session),
    },
  });
}
