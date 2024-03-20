import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getOrdersList = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.session.user.sourceId
    ? { sourceId: ctx.session.user.sourceId }
    : undefined
  return await commerce.getOrdersList({ user })
})
