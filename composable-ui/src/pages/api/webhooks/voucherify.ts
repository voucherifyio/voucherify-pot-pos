import { NextApiRequest, NextApiResponse } from 'next'

const deductPoints = async (code: string, points: number) => {
  const myHeaders = new Headers()
  myHeaders.append('X-App-Id', process.env.VOUCHERIFY_APPLICATION_ID as string)
  myHeaders.append('X-App-Token', process.env.VOUCHERIFY_SECRET_KEY as string)
  myHeaders.append('Content-Type', 'application/json')

  const raw = ''

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      points,
      reason: 'Limit of 1500 applies to customers who have not registered.',
    }),
  }
  // We use fetch as sdk does not have option to filter by customer 😭
  const responseObj = await fetch(
    `${process.env.VOUCHERIFY_API_URL}/v1/loyalties/camp_d7nX6wuJJ60BbS0YaAAHa2zy/members/${code}/balance`,
    requestOptions
  )
  return await responseObj.json()
}

const voucherifyWebhookRoute = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log(req.body)
  if (req.body.type !== 'voucher.loyalty_card.points_added') {
    const message =
      'Only `voucher.loyalty_card.points_added` event tyype supported'
    console.log(`[voucherifyWebhookRoute]`, message)
    return res.status(400).json({ message })
  }

  if (req.body.data?.campaign?.name !== 'Journie PoT Loyalty Program') {
    const message = 'Only `Journie PoT Loyalty Program` campaign supported'
    console.log(`[voucherifyWebhookRoute]`, message)
    return res.status(200).json({ message })
  }

  const balance: number = req.body.data?.balance?.balance || 0
  const isRegistered =
    !!req.body.data?.customer?.metadata?.['registered_customer']

  console.log(`Customer balance`, { balance, isRegistered })

  if (balance > 1500 && !isRegistered) {
    console.log(`we should deduct ${1500 - req.body.data.balance.balance}`)
    const r = await deductPoints(
      req.body.data.voucher.code,
      1500 - req.body.data.balance.balance
    )
    console.log({ r })
  }

  res.status(200).json({ message: 'Hello from POS.js!' })
}

export default voucherifyWebhookRoute
