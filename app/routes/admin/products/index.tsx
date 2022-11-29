import { Card, CardBody, CardFooter } from "@chakra-ui/card"
import * as c from "@chakra-ui/react"
import { Prisma, Product, User } from "@prisma/client"
import { json, LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { filter } from "compression"
import dayjs from "dayjs"

import { LinkButton } from "~/components/LinkButton"
import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Tile } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { getTableParams } from "~/lib/table"
import { getProducts, ProductJson, SellersProducts } from "~/models/products.server"
import { getUser } from "~/models/user.server"
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
  user: User | null;
  products: ProductJson | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const products = await getProducts(request, "subscribers", 1, "");

  const success = async () => {
    const user = await getUser(request);

    return json<LoaderData>({
      user,
      products
    });
  };

  const failure = () => {
    return json<LoaderData>({
      user: null,
      products: null
    });
  };

  return authenticated(request, success, failure);
};

export default function Products() {
  const { user, products } = useLoaderData<typeof loader>()
  return (
    <c.Stack spacing={4}>
      <c.Flex justify="space-between">
        <c.Heading>Products</c.Heading>
        <LinkButton to="new" colorScheme="purple">
          Create
        </LinkButton>
      </c.Flex>
      <Tile>
        <Card maxW='sm'>
          <CardBody>
            <c.Image
              src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
              alt='Green double couch with wooden legs'
              borderRadius='lg'
            />
            <c.Stack mt='6' spacing='3'>
              <c.Heading size='md'>Living room Sofa</c.Heading>
              <c.Text>
                {products.sellers_products}
              </c.Text>
              <c.Text color='blue.600' fontSize='2xl'>
                $450
              </c.Text>
            </c.Stack>
          </CardBody>
          <c.Divider />
          <CardFooter>
            <c.ButtonGroup spacing='2'>
              <c.Button variant='solid' colorScheme='blue'>
                상품 수정
              </c.Button>
            </c.ButtonGroup>
          </CardFooter>
        </Card>
      </Tile>
    </c.Stack>
  )
}
