import { Button, Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useLoyaltyCardsList } from 'hooks/use-loyalty-cards-list'
import { signIn } from 'next-auth/react'

export interface LoyaltyCardsListProps {
  onClick?: (productId: string) => unknown
  campaignId: string
}

export const LoyaltyCardsList = ({ campaignId }: LoyaltyCardsListProps) => {
  const { status, loyaltyCardsList } = useLoyaltyCardsList(campaignId)
  if (status !== 'success') {
    return <></>
  }

  return (
    <Flex direction={'column'} flex={1}>
      <HStack mt={4} mb={4}>
        <Text
          textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
          color={'shading.700'}
        >
          Scan loyalty card{' '}
        </Text>
      </HStack>
      <SimpleGrid columns={3} spacing={4}>
        {loyaltyCardsList?.map((card) => (
          <Flex
            direction={'column'}
            key={card.code}
            padding={'10px'}
            backgroundColor={'#f4f4f4'}
            gap={'10px'}
            borderRadius={'4px'}
          >
            <Flex direction={'column'}>
              <Text fontSize={'14px'} fontWeight={'800'}>
                Customer phone
              </Text>
              <Text fontSize={'14px'}>{card.customerPhone}</Text>
            </Flex>
            <Flex justify={'space-between'} align={'flex-end'}>
              <Image
                onClick={() =>
                  signIn('only-loyalty-card', {
                    redirect: true,
                    code: card.code,
                  })
                }
                style={{ cursor: 'pointer' }}
                //@ts-ignore
                src={card.barcodeUrl}
                width={150}
                height={25}
                alt="asd"
              />
              <Button
                variant={'ghost'}
                size={'sm'}
                borderRadius={'2px'}
                onClick={() =>
                  signIn('only-loyalty-card', {
                    redirect: true,
                    code: card.code,
                  })
                }
              >
                Scan
              </Button>
            </Flex>
          </Flex>
        ))}
      </SimpleGrid>
    </Flex>
  )
}
