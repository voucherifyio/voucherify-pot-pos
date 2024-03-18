import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from 'utils/api'

import { Cart } from '@composable/types'
import { useSession } from 'next-auth/react'
import { useLocalStorage } from 'utils/local-storage'
import {
  LOCAL_STORAGE_CART_ID,
  LOCAL_STORAGE_CART_UPDATED_AT,
} from 'utils/constants'
import { useCart } from './use-cart'
const USE_CUSTOMER_REDEEMABLE_KEY = 'useCustomerRedeemables'

export const useCustomerRedeemables = () => {
  const session = useSession()
  const queryClient = useQueryClient()
  const { client } = api.useContext()
  const { cart } = useCart()
  const [cartId] = useLocalStorage(LOCAL_STORAGE_CART_ID, '')

  /**
   * Fetch Cart
   */
  const { data: customerRedeemables, status } = useQuery(
    [
      USE_CUSTOMER_REDEEMABLE_KEY,
      session.data?.localisation,
      'useCartKey',
      cartId,
      cart,
    ],
    async () => {
      const response = await client.commerce.getCustomerRedeemables.query({
        cartId,
      })
      return response
    },
    {
      enabled: session.status === 'authenticated',
      retry: false,
      keepPreviousData: true,
    }
  )

  /**
   * Public
   */
  return {
    status,
    customerRedeemables,
  }
}
