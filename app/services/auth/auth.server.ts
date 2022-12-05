import type { Prisma, User } from "@prisma/client"
import { createCookieSessionStorage, json, redirect } from "@remix-run/node"

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

type LoginForm = {
  email: string
  password: string
  is_seller: number
}

type RegisterForm = {
  email: string
  password: string
  name: string
  address: string
}

type AuthData = {
  accessToken: string
  refreshToken: string
}

type JoinedUserJson = Pick<User, "id" | "email" | "name" | "password" | "address" | "is_active" | "is_seller" |"signup_method_id" > & { msg: string } 

type RegisterResponse = { 
  user?: JoinedUserJson;
  error?: string 
}
// {
//   "user": {
//   "id": 3,
//   "last_login": null,
//   "email": "user@mail.com",
//   "name": null,
//   "password": "hasing된 password",
//   "address": "주소지",
//   "join_date": "2022-11-16T11:36:15.399182+09:00",
//   "is_active": true,
//   "is_admin": false,
//   "is_seller": false,
//   "signup_method_id": 1
//   },
//   "msg": "회원가입 완료"
//   }

export async function register({ email, password, name, address }: RegisterForm): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}:10000/user/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name, address, signup_method_id: 1, is_seller: 1 }),
    })

    if (response.ok) {
      const data = await response.json()
      return data
      // const data = await response.json();

      // const { accessToken, refreshToken } = data;

      // if (!accessToken || !refreshToken) {
      //   return { error: "No tokens returned from server" };
      // }
      // return { tokens: { accessToken, refreshToken } };
    } else {
      const json = await response.json()
      return { error: json.detail }
    }
  } catch (error) {
    console.error(error)
    return { error: (error as Error).message }
  }
}

export async function login({ email, password, is_seller }: LoginForm) {
  try {
    console.log("body", JSON.stringify({ email, password, is_seller }))

    const response = await fetch(`http://54.180.145.47:10000/user/login`, {
      // ${process.env.API_URL}:10000/user/login
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, is_seller }),
    })

    const data = await response.json()
    const { access, refresh } = data

    if (!access || !refresh) {
      return null
    }

    return { access, refresh }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function logout(request: Request) {
  console.log("logout")

  const session = await authSessionStorage.getSession(request.headers.get("Cookie"))
  return redirect("/login", {
    headers: {
      "Set-Cookie": await authSessionStorage.destroySession(session),
    },
  })
}
