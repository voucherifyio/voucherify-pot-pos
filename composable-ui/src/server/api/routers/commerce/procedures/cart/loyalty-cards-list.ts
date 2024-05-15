import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'
import { z } from 'zod'

export const getLoyaltyCardsList = protectedProcedure
  .input(z.object({ campaignId: z.string() }))
  .query(async ({ input }) => {
    return await commerce.getLoyaltyCardsList({ ...input })
  })
