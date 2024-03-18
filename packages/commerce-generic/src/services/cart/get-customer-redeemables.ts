import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import {
  getCustomerRedeemables as getCustomerRedeemablesClient,
  updateCartDiscount,
} from '@composable/voucherify'

export const getCustomerRedeemables: CommerceService['getCustomerRedeemables'] =
  async ({ user, cartId, localisation }) => {
    if (!user || !user.sourceId) {
      return []
    }
    if (!cartId) {
      return []
    }

    const cart = await getCartFromStorage(cartId)

    if (!cart) {
      return []
    }

    return await getCustomerRedeemablesClient({
      cart,
      customerId: user.sourceId,
      localisation,
    })
  }
