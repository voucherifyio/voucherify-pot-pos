import {
  Container,
  Grid,
  GridItem,
  Text,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
} from '@chakra-ui/react'

import { Customer } from './pos/customer'
import { OrdersList } from './pos/orders-list'
import { useOrder } from 'hooks/use-order'
import { useContext, useState } from 'react'
import { OrderItemList } from './pos/order-item-list'
import dayjs from 'dayjs'
import { LoyaltyProgramContext } from './pos/loyalty-pogram-context'
import { SelectLoyaltyProgramModal } from './select-loyalty-program'
import { useIntl } from 'react-intl'
import { useToast } from 'hooks'

export const ReturnProductsPage = () => {
  const { isLoyaltyProgram } = useContext(LoyaltyProgramContext)
  const [orderId, setOrderId] = useState<string | null>()
  const intl = useIntl()
  const toast = useToast()
  const {
    order,
    status: orderFetchStatus,
    returnProductsFromOrderMutation,
  } = useOrder(orderId, {
    onReturnProductsFromOrderMutationSuccess: () => window.location.reload(),
    onReturnProductsFromOrderMutationError: (error) => {
      toast({
        status: 'error',
        description: intl.formatMessage({
          id: `${error.message}`,
        }),
      })
    },
  })
  const [error, setError] = useState<string | undefined>(undefined)

  const onReturnProducts = (
    voucherifyOrderId: string,
    productsIds: string[],
    campaignName: string
  ) => {
    returnProductsFromOrderMutation({
      voucherifyOrderId,
      productsIds,
      campaignName,
    })
  }

  if (!isLoyaltyProgram) {
    return <SelectLoyaltyProgramModal />
  }

  return (
    <Container maxW="container.2xl" py={{ base: '4', md: '8' }}>
      <Grid templateColumns="repeat(2, 1fr)" gap={'md'}>
        <GridItem w="100%">
          <Customer />
          <Text
            textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
            color={'shading.700'}
          >
            Orders
          </Text>
          <OrdersList onClick={(orderId) => setOrderId(orderId)} />
        </GridItem>
        <GridItem>
          <Text
            textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
            color={'shading.700'}
          >
            Products
          </Text>

          {order && orderFetchStatus === 'success' && (
            <>
              <TableContainer maxWidth={400}>
                <Table size={'sm'}>
                  <Tbody>
                    <Tr>
                      <Td>Created at</Td>
                      <Td>
                        {dayjs(order.created_at).format('YYYY-MM-DD HH:MM')}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Status</Td>
                      <Td color={order.status === 'PAID' ? 'green' : 'gold'}>
                        {order.status}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Order id</Td>
                      <Td>{order.id}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
              <OrderItemList
                onReturnProducts={onReturnProducts}
                order={order}
              />
            </>
          )}
        </GridItem>
      </Grid>
    </Container>
  )
}
