import * as c from "@chakra-ui/react"
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Tile, TileBody, TileHeader, TileHeading } from "~/components/Tile"
import { CurrentUserJson, getUser } from "~/models/user.server";
import authenticated from "~/services/auth/authenticated.server";

// export const loader = async ({ request }: LoaderArgs) => {
//   await requireUser(request)
//   const userCount = await db.user.count()
//   const postCount = await db.post.count()

//   return json({ userCount, postCount })
// }


export const loader: LoaderFunction = async ({ request }) => {
  
  const success = async () => {
    const user = await getUser(request);
    return json(user);
  };

  const failure = () => {
    return json(null);
  };

  return authenticated(request, success, failure);
};

export default function AdminIndex() {
  // const { userCount, postCount } = useLoaderData<LoaderData>()
  const user = useLoaderData<CurrentUserJson>()
  return (
    <c.Stack spacing={4}>
      <c.Heading>관리자 메인 화면</c.Heading>
      <c.SimpleGrid columns={{ base: 1, md: 2 }} spacing={20}>
        <Tile>
          <TileHeader>
            <TileHeading>User count</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Text>{user.name}</c.Text>
          </TileBody>
        </Tile>
        <Tile>
          <TileHeader>
            <TileHeading>Post count</TileHeading>
          </TileHeader>
          <TileBody>
            <c.Text>112</c.Text>
          </TileBody>
        </Tile>
      </c.SimpleGrid>
    </c.Stack>
  )
}
