import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from 'utils/api'

import { useSession } from 'next-auth/react'
import { useCallback, useRef } from 'react'
import { VoucherifyOrder } from '@composable/types'

const USE_ORDER_KEY = 'useOrdersList'

interface UseOrderOptions {
  onReturnProductsFromOrderMutationSuccess?: (
    cart: VoucherifyOrder | null
  ) => void
}

export const useOrder = (
  orderId?: string | null | undefined,
  options?: UseOrderOptions
) => {
  const session = useSession()
  const queryClient = useQueryClient()
  const { client } = api.useContext()
  const optionsRef = useRef(options)
  optionsRef.current = options
  /**
   * Fetch Cart
   */
  const { data: order, status } = useQuery(
    [USE_ORDER_KEY, session, orderId],
    async () => {
      if (!orderId) {
        return
      }
      const response = await client.commerce.getVoucherifyOrder.query({
        voucherifyOrderId: orderId,
      })
      return response
    },
    {
      enabled: session.status === 'authenticated',
      retry: false,
      keepPreviousData: false,
    }
  )

  /**
   * Cart Item Add
   */
  const returnProductsFromOrder = useMutation(
    ['returnProductsFromOrder'],
    async (variables: { voucherifyOrderId: string; productsIds: string[] }) => {
      const params = {
        voucherifyOrderId: variables.voucherifyOrderId,
        productsIds: variables.productsIds,
      }
      const response = await client.commerce.returnProductsFromOrder.mutate(
        params
      )

      return response
    },
    {
      // onError: optionsRef.current?.onCartItemAddError,
    }
  )

  /**
   * Cart Item Add Mutation
   */
  const returnProductsFromOrderMutation = useCallback(
    async (params: { voucherifyOrderId: string; productsIds: string[] }) => {
      await returnProductsFromOrder.mutate(
        {
          voucherifyOrderId: params.voucherifyOrderId,
          productsIds: params.productsIds,
        },
        {
          onSuccess:
            optionsRef.current?.onReturnProductsFromOrderMutationSuccess,
        }
      )
    },
    [returnProductsFromOrder]
  )

  /**
   * Public
   */
  return {
    returnProductsFromOrderMutation,
    status,
    order,
  }
}
