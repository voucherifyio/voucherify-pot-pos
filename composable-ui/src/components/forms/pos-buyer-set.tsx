import { Alert, Button, Box, VStack, HStack } from '@chakra-ui/react'
import { IntlShape, useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { InputField, TitleSection } from '@composable/ui'
import { api } from 'utils/api'
import { AccountPage } from '../account/account-drawer'
import { useSession, signIn, signOut } from 'next-auth/react'

export interface ForgotPasswordFormProps {
  type?: AccountPage
}

export const PosBuyerSetdForm = ({
  type = AccountPage.DRAWER,
}: ForgotPasswordFormProps) => {
  const intl = useIntl()
  const session = useSession()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ phone: string }>({
    resolver: yupResolver(posByerSetFormSchema({ intl })),
    mode: 'all',
  })

  const resetPassword = false // api.commerce.resetPassword.useMutation()

  const content = {
    title: 'Customer',
    description:
      'Let us know who is the buyer so we can show his discounts and collect host loyalty points.',
    input: {
      phone: {
        label: 'Phone number',
        placeholder: 'Phone number',
      },
    },
    button: {
      submit: 'Set customer',
    },
    alert: {
      success: 'Buter set 👏',
    },
  }

  return (
    <Box mb={7}>
      <Box mt={7}>
        <form
          role={'form'}
          aria-label={content.title}
          onSubmit={handleSubmit((data) => {
            signIn('only-phone', {
              redirect: true,
              phone: data.phone,
              localisation: session.data?.localisation,
            })
          })}
        >
          <HStack spacing={6} alignItems={'stretch'}>
            <InputField
              label={content.input.phone.label}
              inputProps={{
                isReadOnly: false,
                placeholder: content.input.phone.placeholder,
                ...register('phone'),
              }}
              error={errors.phone}
            />

            <Box mt="30px" display="flex" justifyContent="center">
              <Button
                variant={'solid'}
                type="submit"
                isDisabled={false}
                isLoading={false}
                width={'full'}
              >
                {content.button.submit}
              </Button>
            </Box>
          </HStack>
        </form>
      </Box>
    </Box>
  )
}

export const posByerSetFormSchema = (deps: { intl: IntlShape }) => {
  const { intl } = deps
  return yup.object().shape({
    phone: yup.string().required('Phone number is required'),
  })
}
