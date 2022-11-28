import { BiCog, BiExit, BiMoon, BiSun, BiUser } from "react-icons/bi"
import { GiHamburgerMenu } from "react-icons/gi"
import * as c from "@chakra-ui/react"
import { Link, useSubmit } from "@remix-run/react"

// import { createImageUrl } from "~/lib/s3"

import { Limiter } from "./Limiter"
import { LinkButton } from "./LinkButton"
import { User } from "@prisma/client"
import { CurrentUserName } from "~/models/user.server"

interface Props {
  user: CurrentUserName | null
}
export function Nav(props: Props) {
  const submit = useSubmit()
  const { colorMode, toggleColorMode } = c.useColorMode()
  const isDark = colorMode === "dark"

  return (
    <c.Box
      w="100%"
      pos="fixed"
      top={0}
      left={0}
      borderBottom="1px solid"
      borderColor={c.useColorModeValue("gray.100", "gray.700")}
      zIndex={500}
    >
      <Limiter
        display="flex"
        transition="200ms all"
        py={{ base: 4, md: 3 }}
        bg={c.useColorModeValue("white", "gray.800")}
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        {/* Left link list */}
        <c.HStack spacing={8}>
          <c.Link fontWeight="bold" as={Link} to="/">
            모아구독
          </c.Link>
        </c.HStack>

        {/* Right link list */}

        {!props.user && (
          <c.Fade in>
            <c.HStack spacing={4} display={{ base: "none", md: "flex" }}>
              <LinkButton to="/login" variant="ghost">
                Login
              </LinkButton>
              <LinkButton to="/register" variant="solid" colorScheme="purple">
                Register
              </LinkButton>
            </c.HStack>
          </c.Fade>
        )}

        {/* Right menu list */}
        <c.Menu placement="bottom-end" closeOnSelect closeOnBlur>
          <c.MenuButton
            as={c.IconButton}
            display={{ base: "flex", md: props.user ? "flex" : "none" }}
            p={0}
            colorScheme={props.user ? "gray" : undefined}
            borderRadius="full"
            icon={
              props.user ? (
                <c.Avatar
                  size="sm"
                  color="black"
                  boxSize="35px"
                  bg="purple.50"
                  src="https://d15f34w2p8l1cc.cloudfront.net/hearthstone/04f991b6a56263b712f7f757069a01029780a6e97bbdc886e9e51ca5e04fc5b6.png"// 센진 방패대가
                  name={props.user.name}
                />
              ) : (
                <c.Box as={GiHamburgerMenu} />
              )
            }
          />

          <c.MenuList fontSize="md">
            {props.user ? (
              <>
                {/* <Link to="/profile">
                  <c.MenuItem icon={<c.Box as={BiUser} boxSize="16px" />}>Profile</c.MenuItem>
                </Link> */}

                <Link to="/admin">
                  <c.MenuItem icon={<c.Box as={BiCog} boxSize="16px" />}>Admin</c.MenuItem>
                </Link>

                <c.MenuDivider />
                <c.MenuItem
                  closeOnSelect={false}
                  icon={<c.Box as={isDark ? BiSun : BiMoon} boxSize="16px" />}
                  onClick={toggleColorMode}
                >
                  Toggle theme
                </c.MenuItem>
                <c.MenuDivider />

                <c.MenuItem
                  onClick={() => submit(null, { method: "post", action: "/logout" })}
                  icon={<c.Box as={BiExit} boxSize="16px" />}
                >
                  Logout
                </c.MenuItem>
              </>
            ) : (
              <>
                <c.MenuItem
                  closeOnSelect={false}
                  icon={<c.Box as={isDark ? BiSun : BiMoon} boxSize="16px" />}
                  onClick={toggleColorMode}
                >
                  Toggle theme
                </c.MenuItem>
                <c.MenuDivider />
                <Link to="/login">
                  <c.MenuItem>Login</c.MenuItem>
                </Link>
                <Link to="/register">
                  <c.MenuItem fontWeight="semibold">Register</c.MenuItem>
                </Link>
              </>
            )}
          </c.MenuList>
        </c.Menu>
      </Limiter>
    </c.Box>
  )
}
