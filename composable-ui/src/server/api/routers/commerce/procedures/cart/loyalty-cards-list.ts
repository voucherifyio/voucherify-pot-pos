import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getLoyaltyCardsList = protectedProcedure.query(async () => {
  return await commerce.getLoyaltyCardsList()
})