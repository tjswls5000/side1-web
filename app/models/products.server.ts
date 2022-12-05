import type { Prisma, Product } from "@prisma/client"

import { db } from "~/lib/db.server"
import { logout } from "~/services/auth/auth.server";
import { getAccessToken } from "~/services/auth/jwt.server";
import { getUser } from "./user.server";

export async function getProducts(request: Request, page: number, filter: string ): Promise<ProductJson | null> {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return null;
  }
  // http://54.180.145.47:8002/seller/product/20?page=1&filter=views
  try {
    const user = await getUser(request)
    const response = await fetch(`${process.env.API_URL}:8002/seller/product/${user?.id}?page=${page}&filter=${filter}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if(response.ok) {
      return await response.json();
    } else {
      throw new Error("get products response not ok");
      
    }
    
  } catch (error) {
    console.error("getProduct error", error);
    return null;
  }
}

// export async function getJoke(jokeId: string): Promise<Joke | null> {
//   try {
//     const response = await fetch(`${process.env.API_URL}/jokes/${jokeId}`);
//     const { joke } = await response.json();
//     return joke;
//   } catch {
//     return null;
//   }
// }

export interface CreateProductInputData {
  category_id: number
  product_group_name: string
  product_name: string
  payment_term_id: number
  register_date: Date
  price: number
  description: string
  detail_images: string[]
}

export async function createProduct(
  request: Request,
  data: CreateProductInputData[]
): Promise<Product> {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    // user not logged in
    throw logout(request);
  }

  try {
    // Authorized route. The access token has the userId in the JWT payload
    const response = await fetch(`${process.env.API_URL}:8002/seller/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // prettier-ignore
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const { product } = await response.json();
    return product;
  } catch {
    throw logout(request);
  }
}

// export async function getAllProducts(request: Request): Promise<Product[]> {
//   try {
//     const response = await fetch(`${process.env.API_URL}/products`);
//     const { productListItems } = await response.json();
//     return productListItems;
//   } catch {
//     return [];
//   }
// }

export type CurrentProduct = Omit<Product, "password">
export type CurrentProductName = Pick<Product, "product_name">
export type SellersProduct = Omit<Product, "seller_id">
export type ProductJson = {
  sellers_products: SellersProduct[],
  total_page: number,
  is_grouped: Boolean
}