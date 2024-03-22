import { Box, Button, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import Image from 'next/image'
import products from '@composable/commerce-generic/src/data/products.json'
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Text,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
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
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Customer phone</Th>
            <Th>Barcode</Th>
            <Th isNumeric>Scan</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loyaltyCardsList?.map((card) => (
            <Tr key={card.code}>
              <Td>{card.customerPhone}</Td>
              {/* @ts-ignore */}
              <Td>
                {' '}
                <Image
                  onClick={() =>
                    signIn('only-loyalty-card', {
                      redirect: true,
                      code: card.code,
                      localisation: session.data?.localisation,
                    })
                  }
                  style={{ cursor: 'pointer' }}
                  src={card.barcodeUrl}
                  width={200}
                  height={25}
                  alt="asd"
                />
              </Td>
              <Td isNumeric>
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  onClick={() =>
                    signIn('only-loyalty-card', {
                      redirect: true,
                      code: card.code,
                      localisation: session.data?.localisation,
                    })
                  }
                >
                  Scan
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>

    // <SimpleGrid mt={8} minChildWidth="250px" spacing={2}>
    //   {loyaltyCardsList?.map((card) => (
    //     <Card key={card.id}>
    //       <CardBody>

    //         <Text>{card.customerPhone}</Text>
    //         <Button

    //           colorScheme="teal"
    //           variant="outline"
    //           size={'sm'}

    //         >
    //           {card.code}
    //         </Button>
    //       </CardBody>
    //     </Card>

    //   ))}
    //   <pre>{JSON.stringify(loyaltyCardsList, null, 2)}</pre>
    // </SimpleGrid>
  )
}
