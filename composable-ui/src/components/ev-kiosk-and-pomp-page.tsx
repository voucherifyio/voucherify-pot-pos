import { FormatNumberOptions, useIntl } from 'react-intl'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import products from '@composable/commerce-generic/src/data/products.json'

import { APP_CONFIG } from '../utils/constants'
import { useCart, usePosCheckout, useToast } from 'hooks'
import { HorizontalProductCardEditablePomp } from '@composable/ui'
import { CartSummaryPomp } from './cart'
import { ProductsList } from './pos/products-list'
import { Customer } from './pos/customer'
import { CustomerRedeemable } from './pos/customer-redeemables'
import { useEffect, useState } from 'react'
import { LoyaltyCardsList } from './pos/loyalty-cards-list'
import { Order } from '@composable/types'
import { useRouter } from 'next/router'

type PompCartItems = {
  name: string
  id: string
  sku: string
  type: string
  quantity: number
  price: number
  imageUrl: string
  imageAlt: string
}

type PompCart = {
  items: PompCartItems[]
  taxes: number
  totalPrice: number
  subtotal: number
}

export const EvKioskAndPompPage = () => {
  const intl = useIntl()

  const [orderAdded, setOrderAdded] = useState<Order | undefined>()
  const toast = useToast()
  const router = useRouter()

  const productsList = products.filter((product) =>
    ['EV Charging 1 kWh', 'Gasoline'].includes(product.name)
  )

  const [pompCart, setPompCart] = useState<PompCart>({
    taxes: 0,
    totalPrice: 0,
    subtotal: 0,
    items: productsList.map((product) => ({
      name: product.name,
      id: product.id,
      sku: product.sku,
      type: product.type,
      price: product.price,
      quantity: 0,
      imageUrl: product.images[0].url,
      imageAlt: product.name,
    })),
  })

  const { placeOrder, order } = usePosCheckout({
    onPlaceOrderSuccess: async (order: Order | undefined) => {
      if (order) {
        await signOut({ redirect: false })
        router.push(`/order/${order.voucherifyOrderId}`)
      } else {
        setOrderAdded(order)
      }
    },
  })

  const productCartSize: 'sm' | 'lg' | undefined = useBreakpointValue({
    base: 'sm',
    md: 'lg',
  })
  const currencyFormatConfig: FormatNumberOptions = {
    currency: APP_CONFIG.CURRENCY_CODE,
    style: 'currency',
  }

  const paidByCash = async () => {
    await placeOrder(
      pompCart.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))
    )
  }

  return (
    <Container maxW="container.2xl" py={{ base: '4', md: '8' }}>
      <Grid templateColumns="repeat(2, 1fr)" gap={'md'}>
        <GridItem w="100%">
          <Customer />

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
          </Flex>

          <>
            <Box mb={8}>
              {pompCart.items?.map((item) => {
                return (
                  <Box
                    key={item.id}
                    mb={8}
                    pb={3}
                    borderBottom={'solid 1px lightgray'}
                  >
                    <HorizontalProductCardEditablePomp
                      key={item.id}
                      // brand={item.brand}
                      columns={4}
                      details={[
                        { name: 'SKU', value: item.sku, id: item.id },
                        { name: 'Type', value: item.type, id: item.id },
                      ]}
                      size={productCartSize}
                      image={{
                        src: item.imageUrl,
                        alt: item.imageAlt,
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
                      totalPrice={intl.formatNumber(
                        item.price * item.quantity,
                        currencyFormatConfig
                      )}
                      onChangeQuantity={(val) => {
                        setPompCart((cart) => {
                          const newItems = cart.items.map((cItem) => {
                            if (cItem.id === item.id) {
                              return {
                                ...cItem,
                                quantity: val,
                              }
                            }
                            return cItem
                          })

                          const subtotal = newItems.reduce(
                            (prev, current) =>
                              prev + current.price * current.quantity,
                            0
                          )
                          const taxes = subtotal * 0.07

                          return {
                            ...cart,
                            items: newItems,
                            taxes,
                            subtotal,
                            totalPrice: taxes + subtotal,
                          }
                        })
                        console.log({
                          quantity: val,
                          itemId: item.id,
                        })
                      }}
                    />
                  </Box>
                )
              })}
            </Box>
            <CartSummaryPomp
              nextButtonAction={paidByCash}
              nextButtonLabel="Paid by cash"
              cartData={{
                isEmpty: false,
                isLoading: false,
                quantity: 1,
                summary: {
                  totalPrice: pompCart.totalPrice.toFixed(2),
                  taxes: pompCart.taxes.toString(),
                  subtotalPrice: pompCart.subtotal.toString(),
                },
              }}
            />
            {/* <pre>{JSON.stringify(pompCart, null, 2)}</pre> */}
          </>
        </GridItem>
        <GridItem w="100%"></GridItem>
      </Grid>
    </Container>
  )
}
