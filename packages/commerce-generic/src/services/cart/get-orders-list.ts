import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { getOrdersList as getOrdersListClient } from '@composable/voucherify'

export const getOrdersList: CommerceService['getOrdersList'] = async () => {
  return (await getOrdersListClient()).map((order) => order.id)
}
