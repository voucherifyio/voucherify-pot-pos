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
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import { useOrdersList } from 'hooks/use-orders-list'
import { signIn, useSession } from 'next-auth/react'
import dayjs from 'dayjs'
import { useIntl } from 'react-intl'
import { Price } from 'components/price'

export interface LoyaltyCardsListProps {
  onClick?: (orderId: string) => unknown
}

export const OrdersList = ({ onClick }: LoyaltyCardsListProps) => {
  const { status, ordersList } = useOrdersList()
  const intl = useIntl()
  const session = useSession()
  if (status !== 'success') {
    return <></>
  }
  return (
    <SimpleGrid mt={8} minChildWidth="120px" spacing={2}>
      {ordersList?.length ? (
        <TableContainer>
          <Table variant="simple" size={'sm'}>
            <TableCaption>Imperial to metric conversion factors</TableCaption>
            <Thead>
              <Tr>
                <Th>Created at</Th>
                <Th>status</Th>
                <Th>location</Th>
                <Th isNumeric>amount</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {ordersList?.map((order) => (
                <Tr key={order.id}>
                  <Td>{dayjs(order.created_at).format('YYYY-MM-DD HH:MM')}</Td>
                  <Td color={order.status === 'PAID' ? 'green' : 'gold'}>
                    {order.status}
                  </Td>
                  <Td>{order.location}</Td>
                  <Td isNumeric>
                    <Price
                      rootProps={{ textStyle: 'Body-S' }}
                      price={
                        order.amount ? (order.amount / 100).toString() : '0'
                      }
                    />{' '}
                  </Td>
                  <Td isNumeric>
                    <Button
                      onClick={() => {
                        onClick?.(order.id)
                      }}
                      variant="ghost"
                    >
                      {order.status === 'PAID' ? 'Return' : 'Preview'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Text>No orders</Text>
      )}
    </SimpleGrid>
  )
}
