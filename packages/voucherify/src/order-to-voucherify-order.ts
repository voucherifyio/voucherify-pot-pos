import { Order } from '@composable/types'
import { OrdersCreate } from '@voucherify/sdk'
import { toCent } from './to-cent'

export const orderToVoucherifyOrder = (order: Order): OrdersCreate => {
  return {
    amount: toCent(order.summary.priceBeforeDiscount),
    items: order.items.map((item) => {
      const subtotal = item.price * item.quantity
      const tax = subtotal * 0.07
      return {
        quantity: item.quantity,
        product_id: item.id,
        sku_id: item.sku,
        price: (item.price + item.tax) * 100,
        amount: (subtotal + tax) * 100,
      }
    }),
  }
}
const LOCALISATIONS = ['West Parkland', 'Fas Gas', 'Parkland Calgary']

export const addLocalisationToOrder = (
  order: OrdersCreate,
  localisation?: string
) => {
  if (!localisation || !LOCALISATIONS.includes(localisation)) {
    return order
  }
  return {
    ...order,
    metadata: { ...(order.metadata || {}), location_id: [localisation] },
  }
}
