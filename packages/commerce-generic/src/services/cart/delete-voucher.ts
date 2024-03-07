import { CommerceService } from '@composable/types'
import {
  getCart as getCartFromStorage,
  saveCart,
} from '../../data/mock-storage'
import { deleteVoucherFromCart } from '@composable/voucherify'
export const deleteVoucher: CommerceService['deleteVoucher'] = async ({
  cartId,
  code,
  user,
}) => {
  const cart = await getCartFromStorage(cartId)

  if (!cart) {
    throw new Error(
      `[updateCartItem] Could not found cart with requested cart id: ${cartId}`
    )
  }

  const { cart: cartWithDiscount, success } = await deleteVoucherFromCart(
    cart,
    code,
    user
  )

  if (success) {
    await saveCart(cartWithDiscount)
  }

  return cartWithDiscount
}
