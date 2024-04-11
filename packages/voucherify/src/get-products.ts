import { getVoucherify } from './voucherify-config'

export const getProducts = async () => {
  try {
    const voucherify = getVoucherify()

    const { products } = await voucherify.products.list()
    return products
  } catch (err) {
    return []
  }
}
