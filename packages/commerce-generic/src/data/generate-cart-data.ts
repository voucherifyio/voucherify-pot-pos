import { Cart, CartItem, ProductListResponse } from '@composable/types'
import { randomUUID } from 'crypto'
export const generateEmptyCart = (cartId?: string): Cart => ({
  id: cartId || randomUUID(),
  items: [],
  promotionsApplied: [],
  vouchersApplied: [],
  summary: {},
})

export const generateCartItem = (
  product: ProductListResponse,
  quantity: number
) => ({
  id: product.id,
  category: product.metadata?.food_category || product.metadata?.category || '',
  brand: product.metadata?.brand,
  image_url: product.image_url || null,
  name: product.name || null,
  price: product.price ? product.price / 100 : 0,
  tax: product.price ? product.price * 0.07 : 0,
  quantity: quantity ?? 1,
  slug:
    product.name
      ?.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(' ', '-') || product.id,
})

export const calculateCartSummary = (
  cartItems: CartItem[]
): Cart['summary'] => {
  const subtotal = cartItems.reduce((_subtotal, item) => {
    return _subtotal + item.price * (item.quantity ?? 1)
  }, 0)
  const taxes = subtotal * 0.07
  const total = subtotal + taxes

  return {
    subtotalPrice: subtotal.toFixed(2),
    taxes: taxes.toFixed(2),
    priceBeforeDiscount: total.toFixed(2),
    totalDiscountAmount: '0',
    totalPrice: total.toFixed(2),
    shipping: 'Free',
  }
}
