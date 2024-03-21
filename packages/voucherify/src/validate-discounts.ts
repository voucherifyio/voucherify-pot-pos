import { Cart, UserSession } from '@composable/types'
import {
  PromotionsValidateResponse,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import {
  getGiftCardRedeemablesForValidation,
  getRedeemablesForValidation,
  getRedeemablesForValidationFromPromotions,
} from './get-redeemables-for-validation'
import { cartToVoucherifyOrder } from './cart-to-voucherify-order'
import { addLocalisationToOrder } from './order-to-voucherify-order'

type ValidateDiscountsParam = {
  cart: Cart
  code?: string
  user?: UserSession
  localisation?: string
  voucherify: ReturnType<typeof VoucherifyServerSide>
}

export type ValidateCouponsAndPromotionsResponse = {
  promotionsResult: PromotionsValidateResponse
  validationResult: ValidateStackableResult
}

export type ValidateStackableResult =
  | false
  | (ValidationValidateStackableResponse & {
      inapplicable_redeemables?: StackableRedeemableResponse[]
    })

export const getCustomerAvailableGasolineVouchers = async (
  voucherify: ReturnType<typeof VoucherifyServerSide>,
  customer: string | undefined
) => {
  if (!customer) {
    return []
  }
  const vouchersResponse = await voucherify.vouchers.list({
    customer: customer,
    campaign: 'Use Case 9 - 7c/l reward',
  })

  return vouchersResponse.vouchers.map((voucher) => ({
    code: voucher.code,
    maxUsage: voucher.gift?.balance || 0,
  }))
}

export const getMaxGasolineDiscountAmountForCart = (cart: Cart) => {
  const gasolineItem = cart.items.find((item) => item.id === 'Gasoline')
  if (!gasolineItem) {
    return 0
  }
  return gasolineItem.quantity * 7
}

export const validateCouponsAndPromotions = async (
  params: ValidateDiscountsParam
): Promise<ValidateCouponsAndPromotionsResponse> => {
  const { cart, code, voucherify, user, localisation } = params

  const appliedCodes =
    cart.vouchersApplied?.map((voucher) => voucher.code) || []

  const order = addLocalisationToOrder(
    cartToVoucherifyOrder(cart),
    localisation
  )
  const customer = user?.sourceId ? { source_id: user.sourceId } : undefined
  const gasolineAvailableVouchers = await getCustomerAvailableGasolineVouchers(
    voucherify,
    customer?.source_id
  )

  const maxGasolineDiscountAmountForCart =
    getMaxGasolineDiscountAmountForCart(cart)

  const codes = code ? [...appliedCodes, code] : appliedCodes

  const gasolineCodes = codes
    .filter((code) =>
      gasolineAvailableVouchers.map((c) => c.code).includes(code)
    )
    .map((code) => gasolineAvailableVouchers.find((e) => e.code === code)!)
  const nonGasolineCodes = codes.filter(
    (code) => !gasolineAvailableVouchers.map((c) => c.code).includes(code)
  )

  const promotionsResult = await voucherify.promotions.validate({
    order,
    customer,
  })

  const redeemables = [
    ...getGiftCardRedeemablesForValidation(
      gasolineCodes,
      maxGasolineDiscountAmountForCart
    ),
    ...getRedeemablesForValidation(nonGasolineCodes),
    ...getRedeemablesForValidationFromPromotions(promotionsResult),
  ].filter((e) => !!e)

  if (!redeemables.length) {
    return { promotionsResult, validationResult: false }
  }

  const validationResult = await voucherify.validations.validateStackable({
    redeemables,
    order,
    customer,
    options: { expand: ['order'] },
  })

  return { promotionsResult, validationResult }
}
