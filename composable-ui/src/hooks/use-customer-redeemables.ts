import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from 'utils/api'
import { useSession } from 'next-auth/react'
import { useLocalStorage } from 'utils/local-storage'
import { LOCAL_STORAGE_CART_ID } from 'utils/constants'
import { useCart } from './use-cart'
import { useLocalisation } from './use-localisation'
import { useCallback, useRef } from 'react'
import { Redeemable } from '@composable/types'
const USE_CUSTOMER_REDEEMABLE_KEY = 'useCustomerRedeemables'

interface UseCustomerRedeemables {
  onUpdateCustomerRedeemablesSuccess?: (redeemables: {
    redeemables: Redeemable[]
    hasMore: boolean
    moreStartingAfter: string
  }) => void
}

export const useCustomerRedeemables = (options?: UseCustomerRedeemables) => {
  const session = useSession()
  const { client } = api.useContext()
  const { cart } = useCart()
  const [cartId] = useLocalStorage(LOCAL_STORAGE_CART_ID, '')
  const { localisation } = useLocalisation()
  const optionsRef = useRef(options)
  optionsRef.current = options

  /**
   * Fetch Cart
   */
  const { data: customerRedeemables, status } = useQuery(
    [USE_CUSTOMER_REDEEMABLE_KEY, localisation, 'useCartKey', cartId, cart],
    async () => {
      const response = await client.commerce.getCustomerRedeemables.query({
        cartId,
        localisation,
      })
      return response
    },
    {
      enabled: session.status === 'authenticated',
      retry: false,
      keepPreviousData: true,
    }
  )
  const updateCustomerRedeemables = useMutation(
    ['updateCustomerRedeemables'],
    async (variables: {
      cartId: string
      localisation: string
      startingAfter: string
    }) => {
      const params = {
        cartId: variables.cartId,
        localisation: variables.localisation,
        startingAfter: variables.startingAfter,
      }
      const response = await client.commerce.updateCustomerRedeemables.mutate(
        params
      )
      return response
    }
  )

  const updateCustomerRedeemablesMutation = useCallback(
    async (params: {
      cartId: string
      localisation: string
      startingAfter: string
    }) => {
      await updateCustomerRedeemables.mutate(
        {
          cartId: params.cartId,
          localisation: params.localisation,
          startingAfter: params.startingAfter,
        },
        {
          onSuccess: optionsRef.current?.onUpdateCustomerRedeemablesSuccess,
        }
      )
    },
    [updateCustomerRedeemables]
  )

  /**
   * Public
   */
  return {
    status,
    customerRedeemables,
    updateCustomerRedeemablesMutation,
  }
}
