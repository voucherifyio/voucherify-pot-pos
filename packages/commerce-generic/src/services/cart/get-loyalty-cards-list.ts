import { CommerceService } from '@composable/types'
import { getCart as getCartFromStorage } from '../../data/mock-storage'
import { getLoyaltyCardsList as getLoyaltyCardsListClient } from '@composable/voucherify'

export const getLoyaltyCardsList: CommerceService['getLoyaltyCardsList'] =
  async () => {
    const loyaltyCards = await getLoyaltyCardsListClient()

    return loyaltyCards.map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      holderId: voucher.holder_id || '',
      //@ts-ignore
      barcodeUrl: (voucher?.assets?.barcode?.url || false) as string | boolean,
      //@ts-ignore
      customerPhone: voucher.customerPhone,
    }))
  }
