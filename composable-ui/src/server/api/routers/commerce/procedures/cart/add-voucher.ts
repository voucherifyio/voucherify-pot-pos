import { protectedProcedure } from '../../../../trpc'
import { z } from 'zod'
import { commerce } from 'server/data-source'

export const addVoucher = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      code: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session.user.sourceId
      ? { sourceId: ctx.session.user.sourceId }
      : undefined
    return await commerce.addVoucher({
      ...input,
      user,
      localisation: ctx.session.localisation,
    })
  })
