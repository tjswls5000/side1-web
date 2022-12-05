import * as c from "@chakra-ui/react"
import { SimpleGrid } from "@chakra-ui/react"
import { Prisma, Product, User } from "@prisma/client"
import { json, LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { filter } from "compression"
import dayjs from "dayjs"
import { useState } from "react"

import { LinkButton } from "~/components/LinkButton"
import { ProductCard } from "~/components/ProductCard"
import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Tile } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { getTableParams } from "~/lib/table"
import { getProducts, ProductJson, SellersProduct } from "~/models/products.server"
import { CurrentUserJson, getUser } from "~/models/user.server"
import authenticated from "~/services/auth/authenticated.server"

const TAKE = 10

const DEFAULT_ORDER = { orderBy: "createdAt", order: Prisma.SortOrder.desc }

// {
//   "sellers_products": [
//   {
//   "id": 34,
//   "product_group_name": "돼지 좋아",
//   "product_name": "갈비",
//   "register_date": "2022-11-12",
//   "update_date": "2022-11-12",
//   "price": 90000,
//   "image": “images",
//   "description": "갈비 600g",
//   "views": 0,
//   "num_of_subscribers": 0,
//   "seller": 1,
//   "category": 1,
//   "payment_term": 3
//   },
//   {
//   "id": 33,
//   "product_group_name": "돼지 좋아",
//   "product_name": "삼목살",
//   "register_date": "2022-11-12",
//   "update_date": "2022-11-12",
//   "price": 30000,
//   "image": “images”,
//   "description": "삼겹살 300g, 목살 300g",
//   "views": 0,
//   "num_of_subscribers": 0,
//   "seller": 1,
//   "category": 1,
//   "payment_term": 3
//   },
//   ],
//   "total_page": 2, 
//   "is_grouped": false
// }

type LoaderData = {
  user: CurrentUserJson | null;
  data: ProductJson | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  
  const success = async () => {
    const user = await getUser(request);
    console.log("success user: ", user);
    const data = await getProducts(request, 1, "subscribers");
    console.log("products: ", data?.sellers_products);
    return json<LoaderData>({
      user,
      data
    });
  };

  const failure = () => {
    return json<LoaderData>({
      user: null,
      data: null
    });
  };

  return authenticated(request, success, failure);
};

export default function Products() {
  const { user, data } = useLoaderData<LoaderData>()// typeof loader
  const [filter, setFilter] = useState("recent");

  return (
    <c.Stack spacing={4}>
      <c.Flex justify="space-between">
        <c.Heading>{user?.name}님이 판매중인 상품입니다.</c.Heading>
        <c.Select placeholder='Select option' value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value='recent'>recent</option>
          <option value='views'>views</option>
          <option value='subscribers'>subscribers</option>
        </c.Select>
        <LinkButton to="new" colorScheme="purple">
          상품 등록
        </LinkButton>
      </c.Flex>
      <SimpleGrid  spacing={4} templateColumns='repeat(auto-fill, minmax(200px, 1fr))' >
      { data?.sellers_products ? (
          data.sellers_products.map((product, i) => {
            return <ProductCard product={product as unknown as SellersProduct} index={i} key={i}/>
            }
          )
      ) : (<c.Text> 판매중인 상품이 없습니다.</c.Text>)}
      </SimpleGrid>
    </c.Stack>
  )
}
