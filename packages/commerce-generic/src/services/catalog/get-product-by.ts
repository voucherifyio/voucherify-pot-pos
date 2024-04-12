import { CommerceService } from '@composable/types'
import { getProduct } from '@composable/voucherify'

export const getProductBy: CommerceService['getProductBy'] = async ({ id }) => {
  const product = await getProduct(id)
  return product
}
