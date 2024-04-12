import { Box, Flex, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import Image from 'next/image'
import products from '@composable/commerce-generic/src/data/products.json'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Divider,
  Select,
} from '@chakra-ui/react'
import { useGetProductList } from 'hooks/use-get-products'
import { ProductListResponse } from '@composable/types'
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from 'react'

export interface ProductsProps {
  onClick?: (product: ProductListResponse) => unknown
}

export const ProductsList = ({ onClick }: ProductsProps) => {
  const { productsList, status } = useGetProductList()
  const [productsCategory, setProductsCategory] = useState('All')

  const productCategories = [
    ...new Set(productsList?.map((product) => product.metadata?.category)),
  ]

  const handleOnChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setProductsCategory(e.target.value)

  const productsByCategory = (productCategory: string) => {
    if (productCategory === 'All') {
      return productsList
    }
    return productsList?.filter(
      (product) => product.metadata?.category === productCategory
    )
  }

  return (
    <>
      <Flex
        justifyContent="flex-start"
        alignItems="center"
        gap="10px"
        marginBottom="10px"
        marginTop="10px"
      >
        <Text fontWeight={600}>Choose category</Text>
        <Select
          size={'sm'}
          maxW={'200px'}
          onChange={(e) => handleOnChange(e)}
          value={productsCategory}
        >
          <option value="All">All</option>
          {productCategories.map((product, i) => (
            <option key={i} value={product}>
              {product}
            </option>
          ))}
        </Select>
      </Flex>
      <SimpleGrid minChildWidth="120px" spacing={2}>
        {products?.length === 0 ? (
          <p>No products</p>
        ) : (
          productsByCategory(productsCategory)?.map((product) => (
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
    </>
  )
}
