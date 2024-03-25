import { Button } from '@chakra-ui/react'
import Image from 'next/image'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { useLoyaltyCardsList } from 'hooks/use-loyalty-cards-list'
import { signIn } from 'next-auth/react'

export interface LoyaltyCardsListProps {
  onClick?: (productId: string) => unknown
}

export const LoyaltyCardsList = ({ onClick }: LoyaltyCardsListProps) => {
  const { status, loyaltyCardsList } = useLoyaltyCardsList()
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
              <Td>
                {' '}
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
  )
}
