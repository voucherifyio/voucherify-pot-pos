import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from 'utils/api'

import { Cart } from '@composable/types'
import { useSession } from 'next-auth/react'

const USE_ORDER_LIST_KEY = 'useOrdersList'

export const useOrdersList = () => {
  const session = useSession()
  const queryClient = useQueryClient()
  const { client } = api.useContext()

  /**
   * Fetch Cart
   */
  const { data: ordersList, status } = useQuery(
    [USE_ORDER_LIST_KEY, session],
    async () => {
      const response = await client.commerce.getOrdersList.query()
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
    ordersList,
  }
}
