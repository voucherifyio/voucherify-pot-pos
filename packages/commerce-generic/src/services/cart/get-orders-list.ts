import { CommerceService } from '@composable/types'
import {
  getOrdersList as getOrdersListClient,
  getCustomer,
} from '@composable/voucherify'

export const getOrdersList: CommerceService['getOrdersList'] = async ({
  user,
}) => {
  if (!user) {
    return []
  }
  const voucherifyCustomer = await getCustomer(user.sourceId)
  if (!voucherifyCustomer) {
    return []
  }
  return getOrdersListClient(voucherifyCustomer.id)
}
