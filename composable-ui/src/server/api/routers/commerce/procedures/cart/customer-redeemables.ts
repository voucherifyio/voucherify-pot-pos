import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getCustomerRedeemables = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      localisation: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = ctx.session.user.sourceId
      ? { sourceId: ctx.session.user.sourceId }
      : undefined
    return await commerce.getCustomerRedeemables({
      user,
      ...input,
    })
  })
