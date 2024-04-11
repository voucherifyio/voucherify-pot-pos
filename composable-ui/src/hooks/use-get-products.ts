import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from 'utils/api'

const USE_GET_PRODUCTS_LIST = 'useGetProductsListKey'

export const useGetProductList = () => {
  const session = useSession()
  const { client } = api.useContext()
  const { data: productsList, status } = useQuery(
    [USE_GET_PRODUCTS_LIST],
    async () => {
      const response = await client.commerce.getProductsList.query()
      return response
    },
    {
      enabled: session.status === 'authenticated',
      retry: false,
      keepPreviousData: true,
    }
  )

  return {
    status,
    productsList,
  }
}
