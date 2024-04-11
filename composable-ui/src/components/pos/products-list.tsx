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
import { useGetProductList } from 'hooks/use-get-products'
import { ProductListResponse } from '@composable/types'

export interface ProductsProps {
  onClick?: (product: ProductListResponse) => unknown
}

export const ProductsList = ({ onClick }: ProductsProps) => {
  const { productsList, status } = useGetProductList()

  return (
    <SimpleGrid minChildWidth="120px" spacing={2}>
      {productsList?.length === 0 ? (
        <p>no products</p>
      ) : (
        productsList?.map((product) => (
          <Card
            _hover={{ bg: 'lightgray' }}
            size={'sm'}
            cursor={'pointer'}
            maxW={120}
            onClick={() => onClick?.(product)}
            key={product.name}
          >
            <CardBody alignContent={'center'}>
              {product.image_url && (
                <Image
                  src={product.image_url || ''}
                  alt={product.name || ''}
                  height={Number(180 / 3)}
                  width={Number(145 / 3)}
                  quality={90}
                  style={{ objectFit: 'cover' }}
                />
              )}
              <Text fontSize="xs">{product.name}</Text>
            </CardBody>
          </Card>
        ))
      )}
    </SimpleGrid>
  )
}
