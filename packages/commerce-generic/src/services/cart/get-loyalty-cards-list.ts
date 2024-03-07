import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { getLoyaltyCardsList as getLoyaltyCardsListClient } from '@composable/voucherify'

export const getLoyaltyCardsList: CommerceService['getLoyaltyCardsList'] =
  async () => {
    return (await getLoyaltyCardsListClient()).map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      holderId: voucher.holder_id || '',
    }))
  }
