import { ChangeEvent, useContext, useState } from 'react'
import { LoyaltyProgramContext } from './pos/loyalty-pogram-context'
import { Button, Container, Select, Text } from '@chakra-ui/react'
import { CAMPAIGNS } from 'enum/campaigns'
import { writeStorage } from 'utils/local-storage'
import { LOCAL_STORAGE_LOYALTY_PROGRAM } from 'utils/constants'
import { useRouter } from 'next/router'

export const SelectLoyaltyProgramModal = () => {
  const { setLoyaltyProgram } = useContext(LoyaltyProgramContext)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectedOption, setSelectedOption] = useState({ name: '', id: '' })
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value as CAMPAIGNS
    setSelectedOption({
      name:
        id === CAMPAIGNS.LOYALTY_PROGRAM_ID
          ? CAMPAIGNS.LOYALTY_PROGRAM
          : CAMPAIGNS.LOYALTY_PROGRAM_EARN_AND_BURN,
      id,
    })
  }

  const handleOnClick = (loyaltyProgram: { name: string; id: string }) => {
    if (!selectedOption.id) {
      return setError('Select loyalty program')
    }
    setLoyaltyProgram(loyaltyProgram)
    writeStorage(LOCAL_STORAGE_LOYALTY_PROGRAM, loyaltyProgram)
    router.reload()
  }

  return (
    <Container
      position={'fixed'}
      top={'50%'}
      left={'50%'}
      transform={'translate(-50%, -50%)'}
      backgroundColor={'#FFF'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'flex-start'}
      flexDirection={'column'}
      padding={'20px'}
      width={'450px'}
      maxW={'100%'}
      maxH={'250px'}
      gap={'30px'}
      boxShadow={'0px 0px 20px -10px rgba(66, 68, 90, 1)'}
    >
      <Text
        textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
        color={'shading.700'}
      >
        Choose your loyalty program
      </Text>
      <Select onChange={handleChange} size={'sm'} placeholder="Select option">
        <option value={CAMPAIGNS.LOYALTY_PROGRAM_ID}>
          {CAMPAIGNS.LOYALTY_PROGRAM}
        </option>
        <option value={CAMPAIGNS.LOYALTY_PROGRAM_EARN_AND_BURN_ID}>
          {CAMPAIGNS.LOYALTY_PROGRAM_EARN_AND_BURN}
        </option>
      </Select>
      {error && (
        <Text
          textStyle={{ base: 'Mobile/S', md: 'Desktop/S' }}
          color={'red.700'}
        >
          Select loyalty program
        </Text>
      )}
      <Button
        disabled={typeof error === 'string'}
        onClick={() => handleOnClick(selectedOption)}
      >
        Choose
      </Button>
    </Container>
  )
}
