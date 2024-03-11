import { Cart, UserSession } from '@composable/types'
import {
  PromotionsValidateResponse,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
  VoucherifyServerSide,
} from '@voucherify/sdk'
import {
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
  const codes = code ? [...appliedCodes, code] : appliedCodes

  const customer = user?.sourceId ? { source_id: user.sourceId } : undefined

  const promotionsResult = await voucherify.promotions.validate({
    order,
    customer,
  })
  if (!codes.length && !promotionsResult.promotions?.length) {
    return { promotionsResult, validationResult: false }
  }

  const validationResult = await voucherify.validations.validateStackable({
    redeemables: [
      ...getRedeemablesForValidation(codes),
      ...getRedeemablesForValidationFromPromotions(promotionsResult),
    ],
    order,
    customer,
    options: { expand: ['order'] },
  })

  return { promotionsResult, validationResult }
}
