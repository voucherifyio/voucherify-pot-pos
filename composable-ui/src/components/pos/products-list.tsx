import { Box, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import Image from 'next/image'
import products from '@composable/commerce-generic/src/data/products.json'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Divider,
} from '@chakra-ui/react'

export interface ProductsProps {
  onClick?: (productId: string) => unknown
  filterProductsByName?: string[]
  filterProductsOutByName?: string[]
}

export const ProductsList = ({
  onClick,
  filterProductsByName,
  filterProductsOutByName,
}: ProductsProps) => {
  const produuctsToList = filterProductsByName
    ? products.filter((product) => filterProductsByName.includes(product.name))
    : filterProductsOutByName
    ? products.filter(
        (product) => !filterProductsOutByName.includes(product.name)
      )
    : products
  return (
    <SimpleGrid minChildWidth="120px" spacing={2}>
      {produuctsToList
        .sort((p1, p2) => p1.type.localeCompare(p2.type))
        .map((product) => (
          <Card
            _hover={{ bg: 'lightgray' }}
            size={'sm'}
            cursor={'pointer'}
            maxW={120}
            onClick={() => onClick?.(product.id)}
            key={product.id}
          >
            <CardBody alignContent={'center'}>
              {product.images[0] && (
                <Image
                  src={product.images[0]?.url}
                  alt={product.images[0]?.alt}
                  height={Number(180 / 3)}
                  width={Number(145 / 3)}
                  quality={90}
                  style={{ objectFit: 'cover' }}
                />
              )}
              <Text fontSize="xs">{product.name}</Text>
            </CardBody>
          </Card>
        ))}
    </SimpleGrid>
  )
}
