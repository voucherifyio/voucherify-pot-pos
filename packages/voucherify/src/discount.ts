import { Cart, Order, UserSession } from '@composable/types'
import { validateCouponsAndPromotions } from './validate-discounts'
import { isRedeemableApplicable } from './is-redeemable-applicable'
import { cartWithDiscount } from './cart-with-discount'
import { getVoucherify } from './voucherify-config'
import { orderToVoucherifyOrder } from './order-to-voucherify-order'
import dayjs from 'dayjs'

export const deleteVoucherFromCart = async (
  cart: Cart,
  code: string,
  user?: UserSession
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  const cartAfterDeletion: Cart = {
    ...cart,
    vouchersApplied: cart.vouchersApplied?.filter(
      (voucher) => voucher.code !== code
    ),
  }
  const updatedCart = await updateCartDiscount(cartAfterDeletion, user)
  return {
    cart: updatedCart,
    success: true,
  }
}

export const updateCartDiscount = async (
  cart: Cart,
  user?: UserSession
): Promise<Cart> => {
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      voucherify: getVoucherify(),
      user,
    })
  return cartWithDiscount(cart, validationResult, promotionsResult)
}

export const addVoucherToCart = async (
  cart: Cart,
  code: string,
  user?: UserSession
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  if (cart.vouchersApplied?.some((voucher) => voucher.code === code)) {
    return {
      cart,
      success: false,
      errorMessage: 'Voucher is already applied',
    }
  }
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      code,
      voucherify: getVoucherify(),
      user,
    })

  const { isApplicable, error } = isRedeemableApplicable(code, validationResult)

  if (isApplicable) {
    const updatedCart = cartWithDiscount(
      cart,
      validationResult,
      promotionsResult
    )
    return {
      cart: updatedCart,
      success: isApplicable,
    }
  }

  return {
    cart,
    success: isApplicable,
    errorMessage: error || 'This voucher is not applicable',
  }
}

export const getCustomer = async (phone: string) => {
  try {
    const voucherify = getVoucherify()
    const customer = await voucherify.customers.get(phone) // phone in source_id
    if (customer.object !== 'customer') {
      return false
    }
    return {
      id: customer.id,
      source_id: customer.source_id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
      registeredCustomer: !!customer.metadata['registered_customer'] || false,
      registrationDate: customer.metadata['registration_date'],
    }
  } catch (e) {
    return false
  }
}
export const getCustomerByLoyaltyCard = async (code: string) => {
  try {
    const voucherify = getVoucherify()
    const loyaltyMember = await voucherify.loyalties.getMember(null, code)
    if (!loyaltyMember || !loyaltyMember.holder_id) {
      return false
    }
    const customer = await voucherify.customers.get(loyaltyMember.holder_id)
    if (customer.object !== 'customer') {
      return false
    }
    return {
      id: customer.id,
      source_id: customer.source_id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
      registeredCustomer: !!customer.metadata['registered_customer'] || false,
      registrationDate: customer.metadata['registration_date'],
    }
  } catch (e) {
    return false
  }
}

export const getLoyaltyCardsList = async () => {
  try {
    const voucherify = getVoucherify()
    const membersResponse = await voucherify.loyalties.listMembers(
      'camp_d7nX6wuJJ60BbS0YaAAHa2zy',
      { limit: 100 }
    )
    return membersResponse.vouchers
  } catch (e) {
    return []
  }
}

export const upsertCustomer = async (phone: string) => {
  try {
    const voucherify = getVoucherify()
    const customer = await voucherify.customers.create({
      source_id: phone,
      phone,
      metadata: {
        registered_customer: false,
        registration_date: dayjs().format('YYYY-MM-DD'),
      },
    })
    if (customer.object !== 'customer') {
      return false
    }
    return {
      id: customer.id,
      source_id: customer.source_id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
      registeredCustomer: !!customer.metadata['registered_customer'] || false,
      registrationDate: customer.metadata['registration_date'],
    }
  } catch (e) {
    return false
  }
}

export const orderPaid = async (order: Order, user?: UserSession) => {
  const voucherifyOrder = orderToVoucherifyOrder(order)
  const voucherify = getVoucherify()
  const vouchers = order.vouchers_applied?.map((voucher) => ({
    id: voucher.code,
    object: 'voucher' as const,
  }))
  const promotions = order.promotions_applied?.map((promotion) => ({
    id: promotion.id,
    object: 'promotion_tier' as const,
  }))
  const customer = user?.sourceId ? { source_id: user.sourceId } : undefined
  const redeemables = [...(vouchers || []), ...(promotions || [])]
  if (redeemables.length) {
    return await voucherify.redemptions.redeemStackable({
      redeemables,
      order: voucherifyOrder,
      options: { expand: ['order'] },
      customer,
    })
  } else {
    return await voucherify.orders.create({
      ...voucherifyOrder,
      status: 'PAID',
      customer,
    })
  }
}
