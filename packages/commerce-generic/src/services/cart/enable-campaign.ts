import { CommerceService } from '@composable/types'
import { handleCampaigns } from '@composable/voucherify'

export const enableCampaign: CommerceService['enableCampaign'] = async ({
  enabledCampaign,
  disabledCampaign,
}) => {
  return await handleCampaigns(enabledCampaign, disabledCampaign)
}
