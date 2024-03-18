import { GetServerSideProps } from 'next'
import { createServerApp } from 'server/isr/server-app'
import { OrderPage } from 'components/order-page'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { ssg } = await createServerApp({ context })
  const voucherifyOrderId =
    typeof context.query?.voucherifyOrderId === 'string'
      ? context.query.voucherifyOrderId
      : false
  if (!voucherifyOrderId) {
    return {
      notFound: true,
    }
  }

  const order = await ssg.commerce.getVoucherifyOrder.fetch({
    voucherifyOrderId,
  })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      order,
    },
  }
}

export default OrderPage
