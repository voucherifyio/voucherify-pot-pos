import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const deleteVoucher = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      code: z.string(),
      localisation: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session.user.sourceId
      ? { sourceId: ctx.session.user.sourceId }
      : undefined
    return await commerce.deleteVoucher({
      ...input,
      user,
    })
  })
