import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'
import { ProductListResponse } from '@composable/types'

const ProductListSchema = z.object({
  id: z.string(),
  source_id: z.string().optional(),
  object: z.literal('product'),
  name: z.string().optional(),
  price: z.number().optional(),
  attributes: z.array(z.string()).optional(),
  created_at: z.string(),
  image_url: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
  skus: z
    .object({
      object: z.literal('list'),
      total: z.number(),
      data: z
        .array(
          z.object({
            id: z.string(),
            source_id: z.string().optional(),
            sku: z.string().optional(),
            price: z.number().optional(),
            attributes: z.record(z.string()).optional(),
            metadata: z.record(z.any()).optional(),
            updated_at: z.string().optional(),
            currency: z.string().optional(),
            created_at: z.string(),
            object: z.literal('sku'),
          })
        )
        .optional(),
    })
    .optional(),
}) satisfies z.ZodSchema<ProductListResponse>

export const addCartItem = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      product: ProductListSchema,
      variantId: z.string().optional(),
      quantity: z.number(),
      localisation: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session.user.sourceId
      ? { sourceId: ctx.session.user.sourceId }
      : undefined
    return await commerce.addCartItem({
      ...input,
      user,
    })
  })
