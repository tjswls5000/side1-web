import { Box } from "@chakra-ui/react"
import { User } from "@prisma/client"
import { json, LoaderFunction } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import { Limiter } from "~/components/Limiter"
import { Nav } from "~/components/Nav"
import { getUser } from "~/models/user.server"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  return json(user)
}

export default function HomeLayout() {
  const user = useLoaderData<User>()
  return (
    <Box>
      <Nav user={user} />
      <Limiter pt="65px">
        <Outlet />
      </Limiter>
    </Box>
  )
}
