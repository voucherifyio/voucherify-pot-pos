export interface Cart {
  id: string
  items: CartItem[]
  promotionsApplied?: Promotion[]
  vouchersApplied?: Voucher[]
  summary: {
    subtotalPrice?: string
    taxes?: string
    totalDiscountAmount?: string
    priceBeforeDiscount?: string
    /**
     * Order amount after applying all the discounts.
     */
    totalPrice?: string
    shipping?: string
  }
}

export interface Promotion {
  id: string
  label: string
  discountAmount: string
}

export interface Voucher {
  code: string
  label: string
  discountAmount: string
  giftCredits: number | null
}

export interface CartItem {
  id: string
  category: string
  brand?: string | undefined
  sku?: string | undefined
  image_url: string | null
  name: string | null
  price: number
  tax: number
  quantity: number
  slug: string
}
