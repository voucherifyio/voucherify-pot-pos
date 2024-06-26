import { VoucherifyServerSide } from '@voucherify/sdk'

let voucherifyInstance: ReturnType<typeof VoucherifyServerSide> | false = false

export const getVoucherify = (): ReturnType<typeof VoucherifyServerSide> => {
  if (
    !process.env.VOUCHERIFY_APPLICATION_ID ||
    !process.env.VOUCHERIFY_SECRET_KEY ||
    !process.env.VOUCHERIFY_API_URL
  ) {
    throw new Error('[voucherify] Missing configuration')
  }

  if (!voucherifyInstance) {
    voucherifyInstance = VoucherifyServerSide({
      applicationId: process.env.VOUCHERIFY_APPLICATION_ID,
      secretKey: process.env.VOUCHERIFY_SECRET_KEY,
      exposeErrorCause: true,
      apiUrl: process.env.VOUCHERIFY_API_URL,
      channel: process.env.NAME || `POS`,
    })
  }
  return voucherifyInstance
}
