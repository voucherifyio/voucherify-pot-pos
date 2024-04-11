import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getProductsList = protectedProcedure.query(async () => {
  return await commerce.getProductsList()
})
