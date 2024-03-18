import { CommerceService } from '@composable/types'
import { getOrder as getOrerFromStorage } from '../../data/mock-storage'
import order from '../../data/order.json'
import shippingMethods from '../../data/shipping-methods.json'
import { getOrder as getVoucherifyOrderService } from '@composable/voucherify'

export const getOrder: CommerceService['getOrder'] = async ({ orderId }) => {
  const order = await getOrerFromStorage(orderId)

  if (!order) {
    throw new Error(`[getOrder] Could not found order: ${orderId}`)
  }

  return {
    ...order,
    shipping_method: shippingMethods[0],
    created_at: Date.now(),
  }
}

//@ts-ignore
export const getVoucherifyOrder: CommerceService['getVoucherifyOrder'] =
  async ({ voucherifyOrderId }) => {
    const order = await getVoucherifyOrderService(voucherifyOrderId)

    return order
  }
