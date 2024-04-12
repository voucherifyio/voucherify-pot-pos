import { CartData } from '../../../hooks'

export const cartData: CartData = {
  id: '7a6dd462-24dc-11ed-861d-0242ac120002',
  items: [
    {
      id: '1',
      category: 'Accessories',
      name: 'Venture Daypack',
      brand: 'Riley',
      price: 129,
      tax: 0.07,
      image_url: '/img/products/_0000s_0001_backpack-rugged-black-front.jpg',
      quantity: 1,
      slug: 'venture-daypack',
    },
  ],
  summary: {
    taxes: '2.45',
    totalPrice: '35.00',
    shipping: 'Free',
  },
  isLoading: false,
  isEmpty: false,
  quantity: 1,
}
