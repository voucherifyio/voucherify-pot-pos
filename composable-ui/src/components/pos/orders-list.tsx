import { Box, Button, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import Image from 'next/image'
import products from '@composable/commerce-generic/src/data/products.json'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Divider,
} from '@chakra-ui/react'
import { useOrdersList } from 'hooks/use-orders-list'
import { signIn, useSession } from 'next-auth/react'

export interface LoyaltyCardsListProps {
  onClick?: (productId: string) => unknown
}

export const OrdersList = ({ onClick }: LoyaltyCardsListProps) => {
  const { status, ordersList } = useOrdersList()
  const session = useSession()
  if (status !== 'success') {
    return <></>
  }
  return (
    <SimpleGrid mt={8} minChildWidth="120px" spacing={2}>
      <pre>{JSON.stringify(ordersList, null, 2)}</pre>
    </SimpleGrid>
  )
}
