import { useCallback, useContext, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { api } from 'utils/api'
import { CheckoutContext } from 'components/checkout/checkout-provider'
import { useCart } from './use-cart'
import { PAYMENT_METHOD } from 'components/checkout/constants'
import { Order } from '@composable/types'
import { useLocalisation } from './use-localisation'

interface UsePosCheckoutOptions {
  onPlaceOrderSuccess?: (order?: Order) => void
}

type Item = {
  productId: string
  quantity: number
}

export const usePosCheckout = (options?: UsePosCheckoutOptions) => {
  const { client } = api.useContext()
  const { cart } = useCart()
  const [order, setOrder] = useState<Order | null>()
  const { localisation } = useLocalisation()

  const optionsRef = useRef(options)
  optionsRef.current = options

  /**
   * Place Order Mutation
   */
  const placeOrderMutation = useMutation(
    ['cartCheckout'],
    async (variables: { items?: Item[] }) => {
      let cartId
      if (variables.items) {
        const response = await client.commerce.createCart.mutate()
        cartId = response.id

        for (const item of variables.items?.filter((item) => item.quantity) ||
          []) {
          await client.commerce.addCartItem.mutate({
            localisation,
            cartId: cartId,
            productId: item.productId,
            quantity: Number(item.quantity),
          })
        }
      } else {
        cartId = cart.id
      }

      if (!cartId) {
        throw new Error('cart not found')
      }

      const response = await client.commerce.createOrder.mutate({
        localisation,
        checkout: {
          cartId,
          customer: {
            email: '',
          },
          billing_address: {
            full_name: '',
            address_line_1: '',
            country: '',
            postcode: '',
            state: '',
          },
          shipping_address: {
            full_name: '',
            address_line_1: '',
            country: '',
            postcode: '',
            state: '',
          },
        },
      })

      setOrder(response)

      return response || undefined
    },
    {
      onMutate: () => {
        console.log(`onMutate`)
      },
      onError: () => {
        console.log(`onmError`)
      },
      onSuccess: optionsRef.current?.onPlaceOrderSuccess,
    }
  )

  const placeOrder = useCallback(
    (items?: Item[]) => {
      return placeOrderMutation.mutateAsync({ items })
    },
    [placeOrderMutation]
  )

  return {
    order,
    placeOrder,
  }
}
