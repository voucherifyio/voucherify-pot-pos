import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const updateCartItem = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      productId: z.string(),
      quantity: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session.user.sourceId
      ? { sourceId: ctx.session.user.sourceId }
      : undefined
    return await commerce.updateCartItem({ ...input, user })
  })
