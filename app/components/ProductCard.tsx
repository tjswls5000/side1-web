import { Card, CardBody, CardFooter } from "@chakra-ui/card"
import * as c from "@chakra-ui/react"
import { SellersProduct } from "~/models/products.server"

interface Props {
  product: SellersProduct
  index: number
  key: number
}

export function ProductCard(props: Props) {
  return (
    <Card maxW="md">
      <CardBody>
        <c.Image
          boxSize="150px"
          src={props.product.image ? props.product.image : undefined}
          alt="product image"
          borderRadius="lg"
        />
        <c.Stack mt="6" spacing="3">
          <c.Heading size="md">{props.product.product_group_name}</c.Heading>
          <c.Text>제품명: {props.product.product_name}</c.Text>
          <c.Text>조회수: {props.product.views}</c.Text>
          <c.Text>구독자수 :{props.product.num_of_subscribers}</c.Text>
          <c.Text>가격: {props.product.price}</c.Text>
        </c.Stack>
      </CardBody>
      <c.Divider />
      <CardFooter>
        <c.ButtonGroup spacing="2">
          <c.Button variant="solid" colorScheme="blue">
            상품 수정
          </c.Button>
        </c.ButtonGroup>
      </CardFooter>
    </Card>
  )
}
