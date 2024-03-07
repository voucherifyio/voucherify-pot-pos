import { FormatNumberOptions, useIntl } from 'react-intl'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
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

import { APP_CONFIG } from '../utils/constants'
import { useCart, usePosCheckout, useToast } from 'hooks'
import { HorizontalProductCardEditablePos } from '@composable/ui'
import { CartSummary } from './cart'
import { ProductsList } from './pos/products-list'
import { Customer } from './pos/customer'
import { useState } from 'react'

export const PosPage = () => {
  const router = useRouter()
  const intl = useIntl()
  const [orderAdded, setOrderAdded] = useState(false)
  const { placeOrder } = usePosCheckout()
  const toast = useToast()
  const { cart, updateCartItem, deleteCartItem, addCartItem, deleteCart } =
    useCart({
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

  const paidByCash = async () => {
    const a = await placeOrder()

    setOrderAdded(true)

    // todo display messgae?
  }
  const nextOrder = async () => {
    await deleteCart()
    console.log('aaa')
    await signOut({ redirect: false })
    console.log('aaa2')
    setOrderAdded(false)
  }

  if (orderAdded) {
    return (
      <Container maxW="container.2xl" py={{ base: '4', md: '8' }}>
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Order paid!
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Customer Farewell Instruction Guide here.
          </AlertDescription>
          <Button onClick={nextOrder}>Next order</Button>
        </Alert>
      </Container>
    )
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
              <CartSummary
                nextButtonAction={paidByCash}
                nextButtonLabel="Paid by cash"
              />
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
