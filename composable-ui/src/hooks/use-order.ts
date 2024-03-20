import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from 'utils/api'

import { useSession } from 'next-auth/react'

const USE_ORDER_KEY = 'useOrdersList'

export const useOrder = (orderId?: string | null | undefined) => {
  const session = useSession()
  const queryClient = useQueryClient()
  const { client } = api.useContext()

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
   * Public
   */
  return {
    status,
    order,
  }
}
