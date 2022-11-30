import { Box } from "@chakra-ui/react"
import { json, LoaderArgs, LoaderFunction, redirect } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import { Limiter } from "~/components/Limiter"
import { Nav } from "~/components/Nav"
import { CurrentUserJson, getUser } from "~/models/user.server"
import authenticated from "~/services/auth/authenticated.server"

// export const loader: LoaderFunction = async ({ request }) => {
//   const user = null //await getUser(request)
//   return json(null)
// }

// export const loader: LoaderFunction = async ({ request }) => {
//   const user = await getUser(request)
//   if(!user) return redirect('/login') 
//   return json(user)
// };

export default function HomeLayout() {
  // const user = useLoaderData<CurrentUserJson>()
  return (
    <Box>
      {/* <Nav user={user} /> */}
      <Limiter pt="65px">
        <Outlet />
      </Limiter>
    </Box>
  )
}
