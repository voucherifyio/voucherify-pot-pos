import { FormatNumberOptions, useIntl } from 'react-intl'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import products from '@composable/commerce-generic/src/data/products.json'

import { APP_CONFIG } from '../utils/constants'
import { useCart, usePosCheckout, useToast } from 'hooks'
import { HorizontalProductCardEditablePomp } from '@composable/ui'
import { CartSummaryPomp } from './cart'
import { ProductsList } from './pos/products-list'
import { Customer } from './pos/customer'
import { OrdersList } from './pos/orders-list'
import { useEffect, useState } from 'react'
import { LoyaltyCardsList } from './pos/loyalty-cards-list'
import { Order } from '@composable/types'
import { useRouter } from 'next/router'

export const ReturnProductsPage = () => {
  return (
    <Container maxW="container.2xl" py={{ base: '4', md: '8' }}>
      <Customer />
      <Text
        textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
        color={'shading.700'}
      >
        Orders
      </Text>
      <OrdersList />
      <Text
        textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
        color={'shading.700'}
      >
        Products
      </Text>

      <Button>Return selected products</Button>
    </Container>
  )
}
