import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'
import { z } from 'zod'

export const enableCampaign = publicProcedure
  .input(
    z.object({ enabledCampaign: z.string(), disabledCampaign: z.string() })
  )
  .mutation(async ({ input }) => {
    return await commerce.enableCampaign({ ...input })
  })
