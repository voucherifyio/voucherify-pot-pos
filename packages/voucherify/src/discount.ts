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
import {
  LoyaltyCardTransaction,
  OrderCalculated,
  OrdersCreate,
  OrdersCreateResponse,
} from '@voucherify/sdk'

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
      console.log(
        `[getCustomerByLoyaltyCard] Is not a loyalty member`,
        loyaltyMember
      )
      return false
    }
    const customer = await voucherify.customers.get(loyaltyMember.holder_id)
    if (customer.object !== 'customer') {
      console.log(
        `[getCustomerByLoyaltyCard] Customer not found, holderId: ${loyaltyMember.holder_id}`
      )
      return false
    }
    return {
      id: customer.id,
      source_id: customer.source_id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
      registeredCustomer: !!customer.metadata?.['registered_customer'] || false,
      registrationDate: customer.metadata?.['registration_date'],
    }
  } catch (e) {
    console.log(`[getCustomerByLoyaltyCard] Error`, e)
    return false
  }
}

const CUSTOMERS_PHONES_CACHE = new Map<string, string | false>()

setInterval(() => {
  console.log(
    `[getLoyaltyCardsList] Clear cache event, current cache size ${CUSTOMERS_PHONES_CACHE.size}`
  )
  CUSTOMERS_PHONES_CACHE.clear()
}, 5 * 60 * 1000)

export const getLoyaltyCardsList = async () => {
  try {
    const voucherify = getVoucherify()
    const membersResponse = await voucherify.loyalties.listMembers(
      'camp_uNiE8OM847iYYQcRizXGmFss',
      { limit: 100 }
    )
    return (
      (
        await Promise.all(
          membersResponse.vouchers.map(async (voucher) => {
            if (!voucher.holder_id) {
              return voucher
            }
            try {
              const hasPhoneCached = CUSTOMERS_PHONES_CACHE.has(
                voucher.holder_id
              )

              if (hasPhoneCached) {
                const phoneCached = CUSTOMERS_PHONES_CACHE.get(
                  voucher.holder_id
                )
                console.log(
                  `[getLoyaltyCardsList] Customer phone get from cache`,
                  { holderId: voucher.holder_id, phone: phoneCached }
                )
                return { ...voucher, customerPhone: phoneCached }
              }

              const customer = await voucherify.customers.get(voucher.holder_id)

              if (customer.object !== 'customer' || !customer.source_id) {
                CUSTOMERS_PHONES_CACHE.set(voucher.holder_id, false)
                console.log(
                  `[getLoyaltyCardsList] Customer missing phone save in cache`,
                  { holderId: voucher.holder_id }
                )
                return voucher
              }

              CUSTOMERS_PHONES_CACHE.set(voucher.holder_id, customer.source_id)
              console.log(
                `[getLoyaltyCardsList] Customer missing phone save in cache`,
                { holderId: voucher.holder_id, phone: customer.source_id }
              )

              return { ...voucher, customerPhone: customer.source_id }
            } catch (e) {
              CUSTOMERS_PHONES_CACHE.set(voucher.holder_id, false)
              console.log(
                `[getLoyaltyCardsList] Customer missing holder save in cache`,
                { holderId: voucher.holder_id }
              )
              return voucher
            }
          })
        )
      )
        //@ts-ignore
        .filter((customer) => customer.customerPhone)
    )
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
      location: order?.metadata?.location_id || '',
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

export const returnProductsFromOrder = async (
  voucherifyOrderId: string,
  productsIds: string[]
) => {
  if (!productsIds.length) {
    throw new Error(
      '[returnProductsFromOrder] We expect aty least one defined product to remove from the order'
    )
  }

  const voucherify = getVoucherify()
  const oldOrder = await voucherify.orders.get(voucherifyOrderId)
  console.log('[returnProductsFromOrder] old order', oldOrder)

  if (!oldOrder.items?.length) {
    throw new Error(
      '[returnProductsFromOrder] We expect from order to have at least one item'
    )
  }

  const customerId = oldOrder.customer?.id
  if (!customerId) {
    throw new Error('[returnProductsFromOrder] Order customer not found')
  }

  const customer = await voucherify.customers.get(customerId)
  console.log('[returnProductsFromOrder] customer', customer)
  if (customer.object !== 'customer') {
    throw new Error('[returnProductsFromOrder] Customer is unconfirmed')
  }

  const vouchersResponse = await voucherify.vouchers.list({
    customer: customer.id,
    campaign: 'Loyalty Program',
  })
  console.log('[returnProductsFromOrder] customer vouchers', vouchersResponse)

  if (vouchersResponse.vouchers.length !== 1) {
    throw new Error(
      '[returnProductsFromOrder] Customer should have one "Journie PoT Loyalty Program" card'
    )
  }

  const loyaltyMemberId = vouchersResponse.vouchers[0].code

  console.log({ loyaltyMemberId })

  const transactions: LoyaltyCardTransaction[] = []

  let hasMore = false
  let page = 1

  do {
    console.log('query page', page)
    const transactionsPage = await voucherify.loyalties.listCardTransactions(
      loyaltyMemberId,
      null,
      { limit: 100, page }
    )
    transactions.push(...transactionsPage.data)
    // it looks like Voucherify opagination is broken, page param is ignored.
    //  hasMore = transactionsPage.has_more;
    //  page++;
  } while (hasMore)

  const transactionsToAmmend = transactions
    .filter((t) => t.type === 'POINTS_ACCRUAL')
    .filter((t) => t.details.order?.id === oldOrder.id)

  if (!transactionsToAmmend.length) {
    console.log(
      '[returnProductsFromOrder] Expected at least one transaction to ammend',
      JSON.stringify(transactionsToAmmend)
    )
    throw new Error(
      '[returnProductsFromOrder] Expected at least one transaction to ammend'
    )
  }
  const pointsToDeduct = transactionsToAmmend.reduce(
    (points, transactionToAmmend) => {
      return points + transactionToAmmend.details.balance.points
    },
    0
  )

  console.log(
    '[returnProductsFromOrder] transactionsToAmmend',
    transactionsToAmmend
  )
  console.log('[returnProductsFromOrder] pointsToDeduct', pointsToDeduct)

  await voucherify.loyalties.addOrRemoveCardBalance(loyaltyMemberId, {
    points: -pointsToDeduct,
    expiration_type: 'NON_EXPIRING',
    reason: `Return products ${productsIds.join(', ')} from order: ${
      oldOrder.id
    }`,
  })
  await voucherify.orders.update({ id: oldOrder.id, status: 'CANCELED' })

  const items = oldOrder.items.filter(
    (oldItem) => !productsIds.includes(oldItem.product_id || '')
  )

  const newOrder: OrdersCreate = {
    customer: { source_id: customer.source_id },
    items,
    metadata: { ...oldOrder.metadata, originOrderId: oldOrder.id },
    status: 'PAID',
  }
  console.log('[returnProductsFromOrder] newOrder', newOrder)
  return items.length
    ? ((await voucherify.orders.create(newOrder)) as OrderCalculated)
    : (oldOrder as OrderCalculated)
}

export const getOrder = async (voucherifyOrderId: string) => {
  try {
    const voucherify = getVoucherify()
    const order = (await voucherify.orders.get(
      voucherifyOrderId
    )) as OrderCalculated

    const redemptionsDetails = (
      await Promise.all(
        Object.keys(order.redemptions || {}).flatMap((redemptionId) => {
          if (order.redemptions![redemptionId].stacked?.length) {
            return order.redemptions![redemptionId].stacked?.map((rId) =>
              voucherify.redemptions.get(rId)
            )
          }
          return voucherify.redemptions.get(redemptionId)
        })
      )
    ).map(async (redemption) => {
      if (!redemption) {
        return false
      }
      if (redemption.voucher && redemption.order) {
        return {
          redemptionId: redemption.id,
          name: [redemption.voucher.campaign, redemption.voucher.code]
            .filter((e) => e)
            .join(' | '),
          discount:
            // @ts-ignore
            redemption.amount || redemption.order.total_applied_discount_amount,
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
  console.log(order, 'ORDER???')
  try {
    const voucherify = getVoucherify()
    const qualificationResponse =
      await voucherify.qualifications.checkEligibility({
        order,
        scenario: 'AUDIENCE_ONLY',
        customer: { source_id: customerId },
        options: { expand: ['redeemable'], limit: 100 },
      })
    const redeemables = qualificationResponse.redeemables.data

    return await Promise.all(
      redeemables.map(async (redeemable) => {
        if (redeemable.object !== 'voucher') {
          return { ...redeemable, barcodeUrl: false }
        }
        const v = await voucherify.vouchers.get(redeemable.id)

        return { ...redeemable, barcodeUrl: v.assets?.barcode?.url }
      })
    )
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

  const voucherify = getVoucherify()
  const vouchers = order.vouchers_applied?.map((voucher) => ({
    id: voucher.code,
    object: 'voucher' as const,
    gift: voucher.giftCredits ? { credits: voucher.giftCredits } : undefined,
  }))
  console.log(vouchers)
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
