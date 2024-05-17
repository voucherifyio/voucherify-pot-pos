import { useMutation } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { api } from 'utils/api'

interface UseHandleCampaignOptions {
  onCampaignHandledSuccess: (data: boolean) => void
}

export const useHandleCampaign = (options?: UseHandleCampaignOptions) => {
  const { client } = api.useContext()
  const optionsRef = useRef(options)
  optionsRef.current = options

  const enableCampaign = useMutation(
    ['enableCampaign'],
    async (variables: {
      enabledCampaign: string
      disabledCampaign: string
    }) => {
      const params = {
        enabledCampaign: variables.enabledCampaign,
        disabledCampaign: variables.disabledCampaign,
      }
      return await client.commerce.enableCampaign.mutate(params)
    }
  )

  const enableCampaignMutation = useCallback(
    async (params: { enabledCampaign: string; disabledCampaign: string }) => {
      await enableCampaign.mutateAsync(
        {
          enabledCampaign: params.enabledCampaign,
          disabledCampaign: params.disabledCampaign,
        },
        {
          onSuccess: optionsRef.current?.onCampaignHandledSuccess,
        }
      )
    },
    [enableCampaign]
  )

  return {
    enableCampaignMutation,
  }
}
