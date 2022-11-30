import type { Prisma, User } from "@prisma/client"

import { db } from "~/lib/db.server"
import { getAccessToken } from "~/services/auth/jwt.server";

// export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
//   if (data.email) {
//     const existing = await db.user.findFirst({ where: { email: { equals: data.email as string } } })
//     if (existing) return { error: "User with these details already exists" }
//   }
//   const user = await db.user.update({ where: { id }, data })
//   return { user }
// }

export async function getUser(request: Request): Promise<CurrentUserJson | null> {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error("getUser error", error);
    return null;
  }
}

export type CurrentUser = Omit<User, "password">
export type CurrentUserJson = Pick<User, "id" | "email" | "name" | "address" | "is_active" | "is_seller"> & {sub_product: number[]}