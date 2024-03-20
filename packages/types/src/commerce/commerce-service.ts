import {
  Cart,
  Category,
  CheckoutInput,
  ShippingMethod,
  Order,
  User,
  UserSession,
  Product,
  SitemapField,
  LoyaltyCard,
} from './index'

type VoucherifyOrderListItem = {
  id: string
  created_at: string
  status: string
  location: string
  amount: number
}

export type VoucherifyOrder = {
  id?: string
  source_id?: string | null
  created_at?: string
  updated_at?: string | null
  status?: 'CREATED' | 'PAID' | 'CANCELED' | 'FULFILLED'
  amount?: number
  initial_amount?: number
  discount_amount?: number
  items_discount_amount?: number
  total_discount_amount?: number
  total_amount?: number
  applied_discount_amount?: number
  items_applied_discount_amount?: number
  total_applied_discount_amount?: number
  items?: VoucherifyOrdersItem[]
  metadata: Record<string, unknown>
  customer?: VoucherifyCustomer
  customer_id: string | null
  // referrer?: ReferrerId | ReferrerWithSummaryLoyaltyReferrals;
  referrer_id: string | null
  object: 'order'
  redemptions?: Record<string, OrderRedemptions>
}
type OrderRedemptions = {
  date?: string
  rollback_id?: string
  rollback_date?: string
  related_object_type?: string
  related_object_id?: string
  related_object_parent_id?: string
  stacked?: string[]
  rollback_stacked?: string[]
}
type VoucherifyOrdersItem = {
  sku_id?: string
  product_id?: string
  related_object?: 'product' | 'sku'
  source_id?: string
  quantity?: number
  discount_quantity?: number
  initial_quantity?: number
  amount?: number
  discount_amount?: number
  initial_amount?: number
  total_applied_discount_amount?: number
  price?: number
  subtotal_amount?: number
  product?: {
    id?: string
    source_id?: string
    override?: boolean
    name?: string
    metadata?: Record<string, any>
    price?: number
  }
  sku?: {
    id?: string
    source_id?: string
    override?: boolean
    sku?: string
    price?: number
  }
  object: 'order_item'
  metadata?: Record<string, any>
}

type VoucherifyCustomer = {
  id?: string
  source_id?: string
  name?: string
  description?: string
  email?: string
  phone?: string
  birthday?: string
  birthdate?: string
  address?: {
    city?: string
    state?: string
    line_1?: string
    line_2?: string
    country?: string
    postal_code?: string
  }
  metadata?: Record<string, any>
}

type Redeemable = {
  id: string
  object: 'campaign' | 'voucher' | 'promotion_tier' | 'promotion_stack'
  campaign_name?: string
}
export interface CommerceService {
  /**
   * Cart methods
   */

  addCartItem(params: {
    cartId: string
    productId: string
    variantId?: string
    quantity: number
    user?: UserSession
    localisation?: string
  }): Promise<Cart>

  createCart(): Promise<Cart>

  deleteCartItem(params: {
    cartId: string
    productId: string
    user?: UserSession
    localisation?: string
  }): Promise<Cart>

  getCart(params: {
    cartId: string
    user?: UserSession
    localisation?: string
  }): Promise<Cart | null>

  updateCartItem(params: {
    cartId: string
    productId: string
    quantity: number
    user?: UserSession
    localisation?: string
  }): Promise<Cart>

  addVoucher(params: {
    cartId: string
    code: string
    user?: UserSession
    localisation?: string
  }): Promise<{
    cart: Cart
    success: boolean
    errorMessage?: string
  }>

  deleteVoucher(params: {
    cartId: string
    code: string
    user?: UserSession
    localisation?: string
  }): Promise<Cart>

  /**
   * Catalog methods
   */

  getCategoryBy(params: { slug: string }): Promise<Category | null>

  getCategories(): Promise<Category[] | null>

  getCategorySitemap(params: {
    siteUrl: string
  }): Promise<SitemapField[] | null>

  getProductBy(params: { slug: string }): Promise<Product | null>

  getProductSitemap: (params: {
    siteUrl: string
  }) => Promise<SitemapField[] | null>

  getProductStaticPaths?: () => Promise<Array<{
    params: { slug: string }
  }> | null>

  /**
   * Checkout methods
   */

  createOrder(params: {
    checkout: CheckoutInput
    user?: UserSession
    localisation?: string
  }): Promise<Order | null>

  getOrder(params: { orderId: string }): Promise<Order | null>

  getVoucherifyOrder(params: {
    voucherifyOrderId: string
  }): Promise<VoucherifyOrder | null>

  returnProductsFromOrder(params: {
    voucherifyOrderId: string
    productsIds: string[]
  }): Promise<VoucherifyOrder | null>

  getShippingMethods(): Promise<ShippingMethod[] | null>

  /**
   * User methods
   */

  createUser(params: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<User | null>

  resetPassword(params: { email: string }): Promise<void>

  getLoyaltyCardsList(): Promise<LoyaltyCard[]>

  getOrdersList(params: {
    user?: UserSession
  }): Promise<VoucherifyOrderListItem[]>

  getCustomerRedeemables(params: {
    user?: UserSession
    cartId: string
    localisation?: string
  }): Promise<Redeemable[]>
}
