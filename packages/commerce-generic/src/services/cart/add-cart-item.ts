import { CommerceService } from '@composable/types'
import { getCart, saveCart } from '../../data/mock-storage'
import {
  generateCartItem,
  calculateCartSummary,
  generateEmptyCart,
} from '../../data/generate-cart-data'
import { updateCartDiscount } from '@composable/voucherify'

export const addCartItem: CommerceService['addCartItem'] = async ({
  cartId,
  product,
  quantity,
  user,
  localisation,
}) => {
  const cart = (await getCart(cartId)) || generateEmptyCart(cartId)
  const isProductInCartAlready = cart.items.some(
    (item) => item.id === product.id
  )

  if (isProductInCartAlready) {
    cart.items.find((item) => item.id === product.id)!.quantity++
  } else {
    const newItem = generateCartItem(product, quantity)
    cart.items.push(newItem)
  }

  cart.summary = calculateCartSummary(cart.items)

  const cartWithDiscount = await updateCartDiscount(cart, user, localisation)
  return saveCart(cartWithDiscount)
}
