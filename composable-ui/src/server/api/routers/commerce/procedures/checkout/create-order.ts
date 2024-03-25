import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const createOrder = protectedProcedure
  .input(
    z.object({
      localisation: z.string(),
      checkout: z.object({
        cartId: z.string(),
        customer: z.object({
          id: z.string().optional(),
          email: z.string(),
        }),
        billing_address: z.object({
          full_name: z.string(),
          address_line_1: z.string(),
          country: z.string(),
          postcode: z.string(),
          state: z.string(),
          city: z.string().optional(),
          phone_number: z.string().optional(),
        }),
        shipping_address: z.object({
          full_name: z.string(),
          address_line_1: z.string(),
          country: z.string(),
          postcode: z.string(),
          state: z.string(),
          city: z.string().optional(),
          phone_number: z.string().optional(),
        }),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session.user.sourceId
      ? { sourceId: ctx.session.user.sourceId }
      : undefined
    return await commerce.createOrder({
      ...input,
      user,
    })
  })
