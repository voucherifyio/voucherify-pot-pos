import { useCallback, useContext, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { api } from 'utils/api'
import { CheckoutContext } from 'components/checkout/checkout-provider'
import { useCart } from './use-cart'
import { PAYMENT_METHOD } from 'components/checkout/constants'
import { Order } from '@composable/types'

interface UsePosCheckoutOptions {
  onPlaceOrderSuccess?: (order?: Order) => void
}

export const usePosCheckout = (options?: UsePosCheckoutOptions) => {
  const { client } = api.useContext()
  const { cart } = useCart()
  const [order, setOrder] = useState<Order | null>()

  const optionsRef = useRef(options)
  optionsRef.current = options

  /**
   * Place Order Mutation
   */
  const placeOrderMutation = useMutation(
    ['cartCheckout'],
    async () => {
      if (!cart?.id) {
        throw new Error('cart not found')
      }
      const response = await client.commerce.createOrder.mutate({
        checkout: {
          cartId: cart.id,
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

  const placeOrder = useCallback(() => {
    return placeOrderMutation.mutateAsync()
  }, [placeOrderMutation])

  return {
    order,
    placeOrder,
  }
}
