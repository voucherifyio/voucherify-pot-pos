import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { updateCartDiscount } from '@composable/voucherify'

export const getCart: CommerceService['getCart'] = async ({ cartId, user }) => {
  if (!cartId) {
    return null
  }

  const cart = await getCartFromStorage(cartId)

  if (!cart) {
    return null
  }

  const cartWithDiscount = await updateCartDiscount(cart, user)

  return cartWithDiscount || null
}
