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
import { useLoyaltyCardsList } from 'hooks/use-loyalty-cards-list'
import { signIn, useSession } from 'next-auth/react'

export interface LoyaltyCardsListProps {
  onClick?: (productId: string) => unknown
}

export const LoyaltyCardsList = ({ onClick }: LoyaltyCardsListProps) => {
  const { status, loyaltyCardsList } = useLoyaltyCardsList()
  const session = useSession()
  if (status !== 'success') {
    return <></>
  }
  return (
    <SimpleGrid mt={8} minChildWidth="120px" spacing={2}>
      {loyaltyCardsList?.map((card) => (
        <Button
          key={card.id}
          colorScheme="teal"
          variant="outline"
          size={'sm'}
          onClick={() =>
            signIn('only-loyalty-card', {
              redirect: true,
              code: card.code,
              localisation: session.data?.localisation,
            })
          }
        >
          {card.code}
        </Button>
      ))}
    </SimpleGrid>
  )
}
