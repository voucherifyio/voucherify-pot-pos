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

import { APP_CONFIG } from '../utils/constants'
import { useCart, usePosCheckout, useToast } from 'hooks'
import { HorizontalProductCardEditablePos } from '@composable/ui'
import { CartSummary } from './cart'
import { ProductsList } from './pos/products-list'
import { Customer } from './pos/customer'
import { CustomerRedeemable } from './pos/customer-redeemables'
import { useContext, useState } from 'react'
import { LoyaltyCardsList } from './pos/loyalty-cards-list'
import { Order, ProductListResponse } from '@composable/types'
import { useRouter } from 'next/router'
import { LoyaltyProgramContext } from './pos/loyalty-pogram-context'
import { SelectLoyaltyProgramModal } from './select-loyalty-program'

export const PosPage = () => {
  const { loyaltyProgram, isLoyaltyProgram } = useContext(LoyaltyProgramContext)
  const intl = useIntl()
  const [orderAdded, setOrderAdded] = useState<Order | undefined>()
  const toast = useToast()
  const router = useRouter()
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
  const { placeOrder, order } = usePosCheckout({
    onPlaceOrderSuccess: async (order: Order | undefined) => {
      if (order) {
        await deleteCart()
        await signOut({ redirect: false })
        router.push(`/order/${order.voucherifyOrderId}`)
      } else {
        setOrderAdded(order)
      }
    },
  })

  const { isLoading, isEmpty, quantity } = cart
  const productCartSize: 'sm' | 'lg' | undefined = useBreakpointValue({
    base: 'sm',
    md: 'lg',
  })
  const currencyFormatConfig: FormatNumberOptions = {
    currency: APP_CONFIG.CURRENCY_CODE,
    style: 'currency',
  }

  const handleAddToCart = (product: ProductListResponse) => {
    if (!product.id || typeof product.id !== 'string') {
      return
    }

    addCartItem.mutate({
      product,
      quantity: 1,
    })
  }

  const paidByCash = async () => {
    await placeOrder()
  }

  const nextOrder = async () => {
    await deleteCart()
    await signOut({ redirect: false })
    setOrderAdded(undefined)
  }

  if (!isLoyaltyProgram) {
    return <SelectLoyaltyProgramModal />
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
          <AlertDescription mb={2}>
            Order id: {orderAdded.id}, Voucherify order id:{' '}
            {orderAdded.voucherifyOrderId}
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
                          {
                            name: 'Category',
                            value: item.category,
                            id: item.id,
                          },
                        ]}
                        size={productCartSize}
                        image={{
                          src: item.image_url || '',
                          alt: item.name || '',
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
      <Flex gap={'30px'}>
        <LoyaltyCardsList campaignId={loyaltyProgram.id} />
        <CustomerRedeemable />
      </Flex>
    </Container>
  )
}
