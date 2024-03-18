import { FormatNumberOptions, useIntl } from 'react-intl'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Container,
} from '@chakra-ui/react'

import { useToast } from 'hooks'
import { VoucherifyOrder } from '@composable/voucherify'
import { Receipt } from './pos/receipt'
import { useRouter } from 'next/router'

export type OrderPageProps = {
  order?: VoucherifyOrder
}

export const OrderPage = (props?: OrderPageProps) => {
  const intl = useIntl()
  const toast = useToast()
  const router = useRouter()
  return (
    <Container centerContent maxW="container.2xl" py={{ base: '4', md: '8' }}>
      {props?.order && <Receipt order={props.order} />}
      <Button mt={6} onClick={() => router.push('/')}>
        Back to POS
      </Button>
      {/* <pre>{JSON.stringify(props?.order, null, 2)}</pre> */}
    </Container>
  )
}
