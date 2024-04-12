import { CommerceService } from '@composable/types'
import { getProducts } from '@composable/voucherify'

export const getProductsList: CommerceService['getProductsList'] = async () => {
  const productsList = await getProducts()

  return productsList?.filter((product) => product.metadata?.category)
}
