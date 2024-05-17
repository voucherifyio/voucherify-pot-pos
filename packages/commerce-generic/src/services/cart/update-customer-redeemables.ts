import { CommerceService } from '@composable/types'
import { getCustomerRedeemables } from '@composable/voucherify'
import { getCart as getCartFromStorage } from '../../data/mock-storage'

//@ts-ignore
export const updateCustomerRedeemables: CommerceService['updateCustomerRedeemables'] =
  async ({ user, cartId, localisation, startingAfter }) => {
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

    return await getCustomerRedeemables({
      cart,
      customerId: user.sourceId,
      localisation,
      startingAfter,
    })
  }
