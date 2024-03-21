import { PromotionsValidateResponse } from '@voucherify/sdk'

export const getGiftCardRedeemablesForValidation = (
  codes: { code: string; maxUsage: number }[],
  totalCredits: number
) => {
  let balance = totalCredits

  return codes
    .map((codeObj) => {
      const credits = Math.min(balance, codeObj.maxUsage)

      balance -= credits

      return {
        id: codeObj.code,
        object: 'voucher' as const,
        gift: {
          credits,
        },
      }
    })
    .filter((code) => code.gift.credits)
}

export const getRedeemablesForValidation = (codes: string[]) =>
  codes.map((code) => ({
    id: code,
    object: 'voucher' as const,
  }))

export const getRedeemablesForValidationFromPromotions = (
  promotionResult: PromotionsValidateResponse
) =>
  promotionResult.promotions?.map((promotion) => ({
    id: promotion.id,
    object: 'promotion_tier' as const,
  })) || []
