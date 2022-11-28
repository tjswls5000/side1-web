import * as c from "@chakra-ui/react"
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node"
import { Link, useTransition } from "@remix-run/react"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { getUser } from "~/models/user.server"
import { register } from "~/services/auth/auth.server"
import { createAuthSession } from "~/services/auth/session.server"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (user) return redirect("/")
  return {}
}

// {
//   "email" : "psb6604@gmail.com",
//   "password" : "1234",
//   "name": "야채좋아",
//   "address": "판매자의주소",
//   "signup_method": 1, 
//   "is_seller": 1
//   }
export const action: ActionFunction  = async ({ request }) => {
  const formData = await request.formData()

  const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Must be at least 8 characters"),
    name: z.string().min(2, "Must be at least 2 characters"),
    address: z.string().max(100, "100자 이하로 입력")
  })
  const { data, fieldErrors } = await validateFormData(registerSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })

  //join_date is_seller is_active
  
  const { tokens, error } = await register(data);
  if (tokens) {
    const { accessToken, refreshToken } = tokens;
    return createAuthSession(accessToken, refreshToken, "/admin");
  } else {
    return badRequest({
      formError: error || `email/Password combination is incorrect`,
    });
  }
}

export default function Register() {
  const { state } = useTransition()

  const isSubmitting = state === "submitting"
  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post">
          <c.Stack spacing={3}>
            <c.Heading as="h1">Register</c.Heading>
            <FormField isRequired label="Email address" name="email" />
            <FormField isRequired label="Password" name="password" type="password" />
            <FormField isRequired label="Name" name="name" />
            <FormField isRequired label="address" name="address" />
            <c.Box>
              <c.Button
                colorScheme="purple"
                type="submit"
                w="100%"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Register
              </c.Button>
              <FormError />
            </c.Box>

            <c.Flex justify="space-between">
              <Link to="/login">Login</Link>
              <Link to="/forgot-password">Forgot password?</Link>
            </c.Flex>
          </c.Stack>
        </Form>
      </c.Box>
    </c.Center>
  )
}
