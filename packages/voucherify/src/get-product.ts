import { getVoucherify } from './voucherify-config'

export const getProduct = async (productId: string) => {
  try {
    const voucherify = getVoucherify()

    const product = await voucherify.products.get(productId)
    return product
  } catch (err) {
    return null
  }
}
