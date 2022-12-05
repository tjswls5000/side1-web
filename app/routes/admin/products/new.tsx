import * as React from "react"
import * as c from "@chakra-ui/react"
import { Category, Product } from "@prisma/client"
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData, useTransition } from "@remix-run/react"
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
import { ImageUploader } from "~/components/ImageUploader"
import { UPLOAD_PATHS } from "~/lib/uploadPaths"
import { useToast } from "@chakra-ui/react"
import Products from "."

type LoaderData = { categories: Category[] };//  | undefined 

export const loader: LoaderFunction = async ({ request }) => {
  // const { search, ...tableParams } = getTableParams(request, TAKE, DEFAULT_ORDER)

  //const categories = await db.category.findMany()
  
  const categories = 
[{id: 1,	name:"IT 서비스",	 image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_it_service.jpg"},
{id: 2,	name:"육류",        image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_meat.jpg"},
{id:3,	name:"가공식품",	   image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_processed_food.jpg"},
{id:4,	name:"커피 및 음료",image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_coffee.jpg"},
{id:5,	name:"주류",        image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_alcohol.jpg"},
{id:6,	name:"도시락",	     image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_luch_box.jpg"},
{id:7,	name:"샐러드",     image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_salad.jpg"},
{id:8,	name:"채소 및 과일",image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_vegetables_fruits.jpg"},
{id:9,	name:"유제품"	,    image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_dairy_product.jpg"},
{id:10, name:"식물",	      image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_plant.jpg"},
{id:11, name:"안주"	 ,     image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_munchies.jpg"},
{id:12, name:"가전제품"	,  image:"https://moagudok.s3.ap-northeast-2.amazonaws.com/base_image/category_base_appliances.jpg"}]
  return json({ categories })// json<LoaderData>({ categories });
  };

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
  //     ]
  //     }, 
  //    ]
  //  }
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
      detail_images: z.string().url().array(),
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
  const { state, type } = useTransition()
  const isSubmitting = state === "submitting"
  const uploader = useFetcher()
  const toast = useToast()

  React.useEffect(() => {
    if (type === "actionRedirect") {
      toast({ description: "image updated", status: "success" })
      setIsDirty(false)
    }
    if (type === "fetchActionRedirect") {
      toast({ description: "image updated", status: "success" })
    }
  }, [type])

  const handleUpdateAvatar = (avatar: string) => {
    uploader.submit({ avatar }, { method: "post", action: "/profile?index" })
  }
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
        <c.Heading>Add new product</c.Heading>
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

            <c.Stack spacing={4}>
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
              <FormField name="product_group_name" label="product_group_name" min={1}/>
              <FormField name="product_name" label="product_name" />
              <FormField name="payment_term_id" label="payment_term_id" input={<c.Textarea rows={1} />} />
              <input type="hidden" name="register_date" value={Date.now()} />{/* <FormField name="register_date" label="register_date" input={<c.Textarea rows={1} />} /> */}
              <FormField name="price" label="price" input={<c.Textarea rows={1} />} />
              <FormField name="description" label="Description" input={<c.Textarea rows={6} />} />
              <c.VStack w="min-content">
                <ImageUploader
                  dropzoneOptions={{ maxSize: 1_000_000 }}
                  path="test_image"
                  onSubmit={handleUpdateAvatar}
                >
                  <c.Avatar src={createImageUrl(Products.)} size="xl" />
                </ImageUploader>
                {user.avatar && ( // 사진 있으면
                  <c.Button
                    colorScheme="red"
                    aria-label="remove image"
                    onClick={() => handleUpdateAvatar("")}
                    size="sm"
                    variant="ghost"
                    leftIcon={<c.Box as={BiTrash} />}
                    borderRadius="lg"
                  >
                    Remove
                  </c.Button>
                )}
              </c.VStack>
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
              <c.ButtonGroup>
              <c.Button
                type="submit"
                // isDisabled={isSubmitting || !isDirty}
                // isLoading={isSubmitting}
                colorScheme="purple"
                size="sm"
              >
                Create
              </c.Button>
            </c.ButtonGroup>
            </c.Stack>

      </Form>
    </c.Stack>
  )
}
