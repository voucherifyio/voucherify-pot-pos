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
}

export const ProductsList = ({ onClick }: ProductsProps) => {
  return (
    <SimpleGrid minChildWidth="120px" spacing={2}>
      {products.map((product) => (
        <Card
          _hover={{ bg: 'lightgray' }}
          size={'sm'}
          cursor={'pointer'}
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
