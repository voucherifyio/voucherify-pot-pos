import { z } from 'zod'
import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const returnProductsFromOrder = publicProcedure
  .input(
    z.object({
      voucherifyOrderId: z.string(),
      productsIds: z.array(z.string()),
      campaignName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    return await commerce.returnProductsFromOrder({ ...input })
  })
