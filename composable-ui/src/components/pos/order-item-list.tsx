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
  Checkbox,
} from '@chakra-ui/react'

import { VoucherifyOrder } from '@composable/types'
import { Price } from 'components/price'
import { useContext, useEffect, useState } from 'react'
import { LoyaltyProgramContext } from './loyalty-pogram-context'

export interface LoyaltyCardsListProps {
  order: VoucherifyOrder | null | undefined
  onReturnProducts?: (
    voucherifyOrderId: string,
    productsIds: string[],
    campaignName: string
  ) => any
}

export const OrderItemList = ({
  order,
  onReturnProducts,
}: LoyaltyCardsListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { loyaltyProgram } = useContext(LoyaltyProgramContext)

  useEffect(() => {
    setSelectedItems([])
  }, [order])

  const onReturn = () => {
    if (!order?.id) {
      return
    }
    onReturnProducts?.(order.id, selectedItems, loyaltyProgram.name)
  }
  if (!order) {
    return null
  }
  return (
    <SimpleGrid mt={8} minChildWidth="120px" spacing={2}>
      <TableContainer>
        <Table variant="simple" size={'sm'}>
          <Thead>
            <Tr>
              <Th>Product name</Th>
              <Th isNumeric>Quantity</Th>
              <Th isNumeric>Price</Th>
              <Th isNumeric>Return</Th>
            </Tr>
          </Thead>
          <Tbody>
            {order.items?.map((item) => (
              <Tr key={item.product_id}>
                <Td>{item.product_id}</Td>
                <Td isNumeric>{item.quantity}</Td>
                <Td isNumeric>
                  <Price
                    rootProps={{ textStyle: 'Body-S' }}
                    price={item.amount ? (item.amount / 100).toString() : '0'}
                  />
                </Td>
                <Td isNumeric>
                  <Checkbox
                    isChecked={selectedItems.includes(item.product_id || '')}
                    onChange={(val) => {
                      setSelectedItems((items) => {
                        if (val.target.checked && item.product_id) {
                          return [...items, item.product_id]
                        }

                        return items.filter((i) => i !== item.product_id) || []
                      })
                    }}
                  ></Checkbox>
                </Td>
              </Tr>
            ))}
          </Tbody>

          <Button
            mt={6}
            size={'sm'}
            isDisabled={order.status !== 'PAID' || selectedItems.length === 0}
            onClick={onReturn}
          >
            Return selected products
          </Button>
        </Table>
        {/* <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
        <pre>{JSON.stringify(order, null, 2)}</pre> */}
      </TableContainer>
    </SimpleGrid>
  )
}
