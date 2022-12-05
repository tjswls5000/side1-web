import * as c from "@chakra-ui/react"
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node"
import { Link, useSearchParams, useTransition } from "@remix-run/react"
import { z } from "zod"

import { Form, FormError, FormField } from "~/components/Form"
import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { createAuthSession } from "~/services/auth/session.server"
import { getUser } from "~/models/user.server"
import { login } from "~/services/auth/auth.server"

export const loader: LoaderFunction = async ({ request }) => {
  console.log("login loader");
  
  return null
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const redirectTo = formData.get("redirectTo") || "/admin"

  const loginSchema = z.object({
    email: z.string().min(3).email("Invalid email"),
    password: z.string().min(4, "Must be at least 4 characters"),
  })

  const { data, fieldErrors } = await validateFormData(loginSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })

  console.log("sEEEEEEEF");
  
    const tokens = await login({...data, is_seller: 1})
    console.log("token: ", tokens);
    
  if (!tokens) {
    return badRequest({
      formError: `email/Password combination is incorrect`,
    });
  }
  const { access, refresh } = tokens;
  return createAuthSession(access, refresh, redirectTo as string);
}

export default function Login() {
  const { state } = useTransition()
  const [searchParams] = useSearchParams()
  const isSubmitting = state === "submitting"
  return (
    <c.Center flexDir="column" pt={10}>
      <c.Box w={["100%", 400]}>
        <Form method="post">
          <c.Stack spacing={3}>
            <c.Heading as="h1">Login</c.Heading>
            <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />
            <FormField isRequired label="Email address" name="email" />
            <FormField isRequired label="Password" name="password" type="password" />
            <c.Box>
              <c.Button
                colorScheme="purple"
                type="submit"
                w="100%"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Login
              </c.Button>
              <FormError />
            </c.Box>

            <c.Flex justify="space-between">
              <Link to="/register">Register</Link>
              <Link to="/forgot-password">Forgot password?</Link>
            </c.Flex>
          </c.Stack>
        </Form>
      </c.Box>
    </c.Center>
  )
}
