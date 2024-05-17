import { getVoucherify } from './voucherify-config'

export const handleCampaigns = async (
  enabledCampaign: string,
  disabledCampaign: string
) => {
  try {
    const voucherify = getVoucherify()
    await voucherify.campaigns.enable(enabledCampaign)
    await voucherify.campaigns.disable(disabledCampaign)

    return true
  } catch (error) {
    return false
  }
}
