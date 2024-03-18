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

  getCustomerRedeemables(params: {
    user?: UserSession
    cartId: string
    localisation?: string
  }): Promise<Redeemable[]>
}
