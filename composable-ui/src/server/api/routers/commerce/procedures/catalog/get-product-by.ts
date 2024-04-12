import { z } from 'zod'
import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getProductBy = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    return await commerce.getProductBy({ id: input.id })
  })
