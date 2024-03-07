import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from 'utils/api'

import { Cart } from '@composable/types'
import { useSession } from 'next-auth/react'

const USE_LOYALTY_CARDS_LIST_KEY = 'useLoyaltyCardsListKey'

export const useLoyaltyCardsList = () => {
  const session = useSession()
  const queryClient = useQueryClient()
  const { client } = api.useContext()

  /**
   * Fetch Cart
   */
  const { data: loyaltyCardsList, status } = useQuery(
    [USE_LOYALTY_CARDS_LIST_KEY, session],
    async () => {
      const response = await client.commerce.getLoyaltyCardsList.query()
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
    loyaltyCardsList,
  }
}
