import { z } from 'zod'
import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getVoucherifyOrder = publicProcedure
  .input(z.object({ voucherifyOrderId: z.string() }))
  .query(async ({ input }) => {
    return await commerce.getVoucherifyOrder({ ...input })
  })
