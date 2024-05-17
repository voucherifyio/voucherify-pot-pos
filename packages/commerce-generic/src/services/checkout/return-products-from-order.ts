import { CommerceService } from '@composable/types'
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
