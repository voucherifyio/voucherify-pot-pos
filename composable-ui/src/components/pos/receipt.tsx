import {
  Box,
  Button,
  HStack,
  Text,
  ListItem,
  UnorderedList,
  Heading,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Center,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Divider,
} from '@chakra-ui/react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { VoucherifyOrder } from '@composable/voucherify'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { useIntl } from 'react-intl'
import { APP_CONFIG } from 'utils/constants'

import { PosBuyerSetdForm } from '../forms/pos-buyer-set'
import { CloseIcon } from '@chakra-ui/icons'

dayjs.extend(LocalizedFormat)

export type ReceiptProps = {
  order: VoucherifyOrder
}

export const Receipt = ({ order }: ReceiptProps) => {
  const intl = useIntl()
  const formatPrice = (price: number | undefined) => {
    if (Number.isNaN(price)) {
      return price
    }
    return intl.formatNumber(parseFloat((price ? price / 100 : 0).toString()), {
      currency: APP_CONFIG.CURRENCY_CODE,
      style: 'currency',
    })
  }

  const locationId =
    order.metadata &&
    order.metadata.location_id &&
    Array.isArray(order.metadata.location_id) &&
    order.metadata.location_id.length === 1
      ? order.metadata.location_id[0]
      : 'Lorem ipsum'

  return (
    <Card maxW={500} p={4} variant="elevated" colorScheme="gray">
      <CardHeader>
        <Center>
          <Heading size="sm">Receipt of sales</Heading>
        </Center>
        <Center>
          <Heading size="md" mt={3}>
            Shop&#39;s name
          </Heading>
        </Center>

        <Text align="center" fontSize="sm" mt={3}>
          Address: {locationId} , 1234-5{' '}
        </Text>
        <Text align="center" fontSize="sm">
          Tel: +1 012 345 67 89{' '}
        </Text>

        <Divider
          variant="dashed"
          mt={3}
          mb={3}
          borderBottomWidth="1px"
          borderBottomColor="black"
        />
        <Text align="center" fontSize="sm" mb={4}>
          {dayjs(order.created_at).format('LLLL')}
        </Text>
      </CardHeader>

      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm" mb={10}>
            <Thead>
              <Tr>
                <Th>QTY</Th>
                <Th>ITEM</Th>
                <Th isNumeric>AMT</Th>
              </Tr>
            </Thead>
            <Tbody>
              {order.items?.map((item) => (
                <Tr key={item.product_id}>
                  <Td>{item.quantity}</Td>
                  <Td>{item.product?.name || item.product_id}</Td>
                  <Td isNumeric> {formatPrice(item.amount)} </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Divider
          variant="dashed"
          borderBottomWidth="1px"
          borderBottomColor="black"
        />
        <TableContainer>
          <Table variant="simple" size="sm" mb={10}>
            <Tbody>
              <Tr>
                <Td>Subtotal</Td>
                <Td isNumeric>{formatPrice(order.amount)}</Td>
              </Tr>
              {order.redemptionsDetails.map((redemptionDetail) => (
                <Tr key={redemptionDetail.redemptionId}>
                  <Td>{redemptionDetail.name}</Td>
                  <Td color="green" fontWeight="bold" isNumeric>
                    {' '}
                    {order.total_discount_amount && '-'}{' '}
                    {formatPrice(redemptionDetail.discount)}
                  </Td>
                </Tr>
              ))}
              <Tr>
                <Td fontSize="large" fontWeight="bold">
                  Total
                </Td>
                <Td isNumeric fontSize="large" fontWeight="bold">
                  {formatPrice(order.total_amount)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Center>
          <Text mb={6}>
            Payment status:{' '}
            <span style={{ color: order.status === 'PAID' ? 'green' : 'red' }}>
              {order.status}
            </span>
          </Text>
        </Center>
        <Divider
          variant="dashed"
          borderBottomWidth="1px"
          borderBottomColor="black"
        />
        <Text mt={6} align="center">
          Thank you!
        </Text>
      </CardBody>
    </Card>
  )
}
