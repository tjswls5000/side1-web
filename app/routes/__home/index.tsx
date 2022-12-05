import * as c from "@chakra-ui/react"

import { Limiter } from "~/components/Limiter"
import { LinkButton } from "~/components/LinkButton"

export default function Home() {
  return (
    <Limiter pt={20} minH="100vh">
      <c.VStack spacing={10}>
        <c.Heading as="h1" mb={4} textAlign="center">
          HOME
        </c.Heading>
        {/* <LinkButton to="Products">See Products</LinkButton> */}
      </c.VStack>
    </Limiter>
  )
}
