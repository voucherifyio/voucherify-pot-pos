import { FormatNumberOptions, useIntl } from 'react-intl'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import {
  Box,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'

import { APP_CONFIG } from '../utils/constants'
import { useCart, useToast } from 'hooks'
import { HorizontalProductCardEditablePos } from '@composable/ui'
import {
  CartEmptyState,
  CartLoadingState,
  CartSummary,
  CartTotal,
} from './cart'
import { ProductsList } from './pos/products-list'
import { Customer } from './pos/customer'

export const PosPage = () => {
  const router = useRouter()
  const intl = useIntl()
  const toast = useToast()
  const { cart, updateCartItem, deleteCartItem, addCartItem } = useCart({
    onCartItemUpdateError: () => {
      toast({
        status: 'error',
        description: intl.formatMessage({ id: 'app.failure' }),
      })
    },
    onCartItemDeleteError: () => {
      toast({
        status: 'error',
        description: intl.formatMessage({ id: 'app.failure' }),
      })
    },
  })

  const { isLoading, isEmpty, quantity } = cart
  const title = intl.formatMessage({ id: 'cart.title' })
  const productCartSize: 'sm' | 'lg' | undefined = useBreakpointValue({
    base: 'sm',
    md: 'lg',
  })
  const currencyFormatConfig: FormatNumberOptions = {
    currency: APP_CONFIG.CURRENCY_CODE,
    style: 'currency',
  }

  const handleAddToCart = (productId: unknown) => {
    if (!productId || typeof productId !== 'string') {
      return
    }

    addCartItem.mutate({
      productId: productId,
      quantity: 1,
    })
  }

  return (
    <Container maxW="container.2xl" py={{ base: '4', md: '8' }}>
      <Grid templateColumns="repeat(2, 1fr)" gap={'md'}>
        <GridItem w="100%">
          <Flex
            gap={{ base: '0.5rem', md: '0.625rem' }}
            mb={'1.5rem'}
            alignItems={'baseline'}
          >
            <Text
              textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
              color={'shading.700'}
            >
              Order
            </Text>
            <Text
              textStyle={{ base: 'Mobile/Body-L', md: 'Desktop/Body-XL' }}
              color={'text-muted'}
            >
              {intl.formatMessage(
                {
                  id:
                    quantity <= 1
                      ? 'cart.titleCount.singular'
                      : 'cart.titleCount.plural',
                },
                { count: quantity }
              )}
            </Text>
          </Flex>
          {!isLoading && (
            <>
              <Box mb={8}>
                {isEmpty && <Text>No products in cart</Text>}
                {cart?.items?.map((item) => {
                  return (
                    <Box
                      key={item.id}
                      mb={8}
                      pb={3}
                      borderBottom={'solid 1px lightgray'}
                    >
                      <HorizontalProductCardEditablePos
                        key={item.id}
                        brand={item.brand}
                        columns={4}
                        details={[
                          { name: 'SKU', value: item.sku, id: item.id },
                          { name: 'Type', value: item.type, id: item.id },
                        ]}
                        size={productCartSize}
                        image={{
                          src: item.image.url,
                          alt: item.image.alt ?? item.name,
                        }}
                        name={item.name || ''}
                        labels={{
                          quantity: intl.formatMessage({
                            id: 'cart.item.quantity',
                          }),
                          itemPrice: intl.formatMessage({
                            id: 'cart.item.price',
                          }),
                          totalPrice: intl.formatMessage({
                            id: 'cart.item.totalPrice',
                          }),
                          remove: intl.formatMessage({ id: 'action.remove' }),
                        }}
                        quantity={item.quantity}
                        regularPrice={intl.formatNumber(
                          item.price,
                          currencyFormatConfig
                        )}
                        onRemove={() => {
                          deleteCartItem.mutate({ itemId: item.id })
                        }}
                        onChangeQuantity={(val) => {
                          updateCartItem.mutate({
                            quantity: val,
                            itemId: item.id,
                          })
                        }}
                        isLoading={
                          updateCartItem.isLoading || deleteCartItem.isLoading
                        }
                      />
                    </Box>
                  )
                })}
              </Box>
              <CartSummary />
            </>
          )}
        </GridItem>
        <GridItem w="100%">
          <Customer />
          <Text
            textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
            color={'shading.700'}
          >
            Scan product
          </Text>
          <ProductsList onClick={handleAddToCart} />
        </GridItem>
      </Grid>
    </Container>
  )
}
