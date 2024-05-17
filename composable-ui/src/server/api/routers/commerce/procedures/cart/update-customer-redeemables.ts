import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'
import { z } from 'zod'

export const updateCustomerRedeemables = publicProcedure
  .input(
    z.object({
      cartId: z.string(),
      localisation: z.string(),
      startingAfter: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session?.user?.sourceId
      ? { sourceId: ctx.session?.user?.sourceId }
      : undefined

    return await commerce.updateCustomerRedeemables({
      user,
      ...input,
    })
  })
