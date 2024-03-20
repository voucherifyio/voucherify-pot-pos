import { Cart, Order, UserSession } from '@composable/types'
import { validateCouponsAndPromotions } from './validate-discounts'
import { isRedeemableApplicable } from './is-redeemable-applicable'
import { cartWithDiscount } from './cart-with-discount'
import { getVoucherify } from './voucherify-config'
import {
  orderToVoucherifyOrder,
  addLocalisationToOrder,
} from './order-to-voucherify-order'
import dayjs from 'dayjs'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'
import { OrderCalculated, OrdersCreateResponse } from '@voucherify/sdk'

export const deleteVoucherFromCart = async (
  cart: Cart,
  code: string,
  user?: UserSession,
  localisation?: string
): Promise<{ cart: Cart; success: boolean; errorMessage?: string }> => {
  const cartAfterDeletion: Cart = {
    ...cart,
    vouchersApplied: cart.vouchersApplied?.filter(
      (voucher) => voucher.code !== code
    ),
  }
  const updatedCart = await updateCartDiscount(
    cartAfterDeletion,
    user,
    localisation
  )
  return {
    cart: updatedCart,
    success: true,
  }
}

export const updateCartDiscount = async (
  cart: Cart,
  user?: UserSession,
  localisation?: string
): Promise<Cart> => {
  const { validationResult, promotionsResult } =
    await validateCouponsAndPromotions({
      cart,
      voucherify: getVoucherify(),
      user,
      localisation,
    })
  return cartWithDiscount(cart, validationResult, promotionsResult)
}

export const addVoucherToCart = async (
  cart: Cart,
  code: string,
  user?: UserSession,
  localisation?: string
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
      localisation,
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

export type VoucherifyOrderListItem = {
  id: string
  created_at: string
  status: string
  location: string
  amount: number
}

export const getOrdersList = async (
  customerId: string
): Promise<VoucherifyOrderListItem[]> => {
  try {
    const myHeaders = new Headers()
    myHeaders.append(
      'X-App-Id',
      process.env.VOUCHERIFY_APPLICATION_ID as string
    )
    myHeaders.append('X-App-Token', process.env.VOUCHERIFY_SECRET_KEY as string)
    myHeaders.append('Content-Type', 'application/json')

    const raw = ''

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
    }
    // We use fetch as sdk does not have option to filter by customer 😭
    const responseObj = await fetch(
      `${process.env.VOUCHERIFY_API_URL}/v1/orders?limit=100&customer=${customerId}`,
      requestOptions
    )
    const response = await responseObj.json()
    //@ts-ignore
    return response.orders.map((order) => ({
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      location: order?.metadata?.location_id?.[0] || '',
      amount: order.amount,
    }))
  } catch (e) {
    return []
  }
}

export type RedemptionsDetail = {
  redemptionId: string
  name: string
  discount?: number
}
export type VoucherifyOrder = OrderCalculated & {
  redemptionsDetails: RedemptionsDetail[]
}
export const getOrder = async (voucherifyOrderId: string) => {
  try {
    const voucherify = getVoucherify()
    const order = (await voucherify.orders.get(
      voucherifyOrderId
    )) as OrderCalculated

    const redemptionsDetails = (
      await Promise.all(
        Object.keys(order.redemptions || {}).map((redemptionId) =>
          voucherify.redemptions.get(redemptionId)
        )
      )
    ).map(async (redemption) => {
      console.log(redemption)

      if (redemption.voucher && redemption.order) {
        return {
          redemptionId: redemption.id,
          name: [redemption.voucher.campaign, redemption.voucher.code]
            .filter((e) => e)
            .join(' | '),
          discount: redemption.order.total_discount_amount,
        } as RedemptionsDetail
      }

      if (
        //@ts-ignore
        redemption.promotion_tier &&
        redemption.order &&
        redemption.order.total_discount_amount
      ) {
        //@ts-ignore

        try {
          const tier = await voucherify.promotions.tiers.get(
            //@ts-ignore
            redemption.promotion_tier.id
          )
          console.log({ tier })
          return {
            redemptionId: redemption.id,
            //@ts-ignore
            name: `${tier.name}`,
            discount: redemption.order.total_discount_amount,
          } as RedemptionsDetail
        } catch (e) {
          return {
            redemptionId: redemption.id,
            //@ts-ignore
            name: `${redemption.promotion_tier.id} (deleted)`,
            discount: redemption.order.total_discount_amount,
          } as RedemptionsDetail
        }
      }

      return false
    })

    return {
      ...order,
      redemptionsDetails: (await Promise.all(redemptionsDetails)).filter(
        (e) => e
      ),
    }
  } catch (e) {
    return null
  }
}

export const getCustomerRedeemables = async (props: {
  cart: Cart
  customerId: string
  localisation?: string
}) => {
  const { cart, customerId, localisation } = props
  const order = addLocalisationToOrder(
    cartToVoucherifyOrder(cart),
    localisation
  )
  try {
    const voucherify = getVoucherify()
    console.log('redeemables order', order)
    const qualificationResponse =
      await voucherify.qualifications.checkEligibility({
        order,
        scenario: 'CUSTOMER_WALLET',
        customer: { source_id: customerId },
        options: { expand: ['redeemable'] },
      })
    return qualificationResponse.redeemables.data
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

export const orderPaid = async (
  order: Order,
  user?: UserSession,
  localisation?: string
) => {
  const voucherifyOrder = addLocalisationToOrder(
    orderToVoucherifyOrder(order),
    localisation
  )
  console.log({ voucherifyOrder })
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
    const redeemResult = await voucherify.redemptions.redeemStackable({
      redeemables,
      order: voucherifyOrder,
      options: { expand: ['order'] },
      customer,
    })
    return redeemResult.order?.id
  } else {
    const orderResult = await voucherify.orders.create({
      ...voucherifyOrder,
      status: 'PAID',
      customer,
    })
    return orderResult.id
  }
}
