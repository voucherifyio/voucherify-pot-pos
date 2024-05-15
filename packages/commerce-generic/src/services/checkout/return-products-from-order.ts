import { CommerceService } from '@composable/types'
import { getOrder as getOrerFromStorage } from '../../data/mock-storage'
import order from '../../data/order.json'
import shippingMethods from '../../data/shipping-methods.json'
import { returnProductsFromOrder as returnProductsFromOrderService } from '@composable/voucherify'

//@ts-ignore
export const returnProductsFromOrder: CommerceService['returnProductsFromOrder'] =
  async ({ voucherifyOrderId, productsIds, campaignName }) => {
    const order = await returnProductsFromOrderService(
      voucherifyOrderId,
      productsIds,
      campaignName
    )
    return order
  }
