import * as React from "react"
import * as c from "@chakra-ui/react"
import { Category, Product } from "@prisma/client"
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData, useTransition } from "@remix-run/react"
import { z } from "zod"

import { createImageUrl } from "~/lib/s3"

import { Form, FormError, FormField } from "~/components/Form"
import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { db } from "~/lib/db.server"
import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { getUser } from "~/models/user.server"
import { createProduct } from "~/models/products.server"
import authenticated from "~/services/auth/authenticated.server"

type LoaderData = { categories: Category[] };//  | undefined 

export const loader: LoaderFunction = async ({ request }) => {
  // const { search, ...tableParams } = getTableParams(request, TAKE, DEFAULT_ORDER)

  const categories = await db.category.findMany()
  
  return json<LoaderData>({ categories });
  };

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const productSchema = z
    .object({
      category_id: z.number(),
      product_group_name: z.string().min(1, { message: "Required" }),
      product_name: z.string().min(1, { message: "Required" }),
      payment_term_id: z.number(),
      register_date: z.date(),
      price: z.number(),
      description: z.string().min(1, { message: "Required" }),
      detail_images: z.string().url(),
    })
    .array()

  const { data, fieldErrors } = await validateFormData(productSchema, formData)
  const user = await getUser(request)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  //const post = await db.post.create({ data: { ...data, author: { connect: { id: user.id } } } })
  await createProduct(request, data)
  return redirect(`/admin/product`)
}

export default function NewProduct() {
  const { categories } = useLoaderData<LoaderData>()
  const [isDirty, setIsDirty] = React.useState(false)
  const { state } = useTransition()
  const isSubmitting = state === "submitting"
  // {
  //   “data” : [
  //    {
  //     “category_id” : 1,
  //     “product_group_name” : “돼지좋아”
  //     “product_name” : “삼목살”,
  //     ”payment_term_id” : 2,
  //     “register_date”:2022-11-01,
  //     “price” : 30000,
  //     “description” : “삼겹살300g, 목300g”,
  //     “detail_images” = [
  //           “이미지url”,
  //           “이미지url”
  //        ]
  //     },
  //     {
  //     “category_id” : 1,
  //     “product_group_name” : “돼지좋아”
  //     “product_name” : “등심럽”,
  //     ”payment_term_id” : 2,
  //     “register_date”:2022-11-01,
  //     “price” : 30000,
  //     “description” : “등심600g ”,
  //     “detail_images” = [
  //           “이미지url”,
  //           “이미지url”
  //        ]
  //     },
  //    ]
  //  }

  // 상품 카테고리 : [구독형, 렌탈형] dropdown
  // 상품 그룹명 : 돼지 좋아 (Textbox)
  // 상품명 : 삼목살 (Textbox)
  // 상품 구독 주기 : [일,주,월] dropdown
  // 상품 가격 : 30000 (Textbox)
  // 상품 상세 이미지 (부가 이미지 여러장)
  // 설명 : 삼겹살 300g 목살 300g
  return (
    <c.Stack spacing={4}>
      <c.Flex justify="space-between">
        <c.Heading>New product</c.Heading>
      </c.Flex>

      <Form
        method="post"
        onChange={(e) => {
          const formData = new FormData(e.currentTarget)
          const data = Object.fromEntries(formData)
          const isDirty = Object.values(data).some((val) => !!val)
          setIsDirty(isDirty)
        }}
      >
        <Tile>
          <TileHeader>
            <TileHeading>Info</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Stack spacing={4}>
              <FormField name="title" label="Title" placeholder="My product" min={1} />
              <FormField name="description" label="Description" input={<c.Textarea rows={6} />} />
              <FormField
                name="category_id"
                label="Category"
                input={
                  <c.Select placeholder='Select category'>
                    {categories.map(({ id, name }) => (
                      <option value={id} key={id}>
                        {name}
                      </option>
                    ))}
                  </c.Select>
                }
              />
              {/* <FormField
                name="type"
                label="Type"
                placeholder="Select type"
                input={
                  <c.Select>
                    {POST_TYPE_OPTIONS.map(({ value, label }) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </c.Select>
                }
              /> */}
              <FormError />
            </c.Stack>
          </TileBody>
          <TileFooter>
            <c.ButtonGroup>
              <c.Button
                type="submit"
                isDisabled={isSubmitting || !isDirty}
                isLoading={isSubmitting}
                colorScheme="purple"
                size="sm"
              >
                Create
              </c.Button>
            </c.ButtonGroup>
          </TileFooter>
        </Tile>
      </Form>
    </c.Stack>
  )
}
