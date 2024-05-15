import { CAMPAIGNS } from 'enum/campaigns'
import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react'
import { LOCAL_STORAGE_LOYALTY_PROGRAM } from 'utils/constants'
import { useLocalStorage } from 'utils/local-storage'

type LoyaltyProgramContextType = {
  loyaltyProgram: { name: CAMPAIGNS | string; id: CAMPAIGNS | string }
  setLoyaltyProgram: Dispatch<
    SetStateAction<{ name: CAMPAIGNS | string; id: CAMPAIGNS | string }>
  >
  isLoyaltyProgram: boolean
  setIsLoyaltyProgram: Dispatch<SetStateAction<boolean>>
}

export const LoyaltyProgramContext = createContext<LoyaltyProgramContextType>({
  loyaltyProgram: {
    name: CAMPAIGNS.LOYALTY_PROGRAM,
    id: CAMPAIGNS.LOYALTY_PROGRAM_ID,
  },
  setLoyaltyProgram: () => {},
  isLoyaltyProgram: false,
  setIsLoyaltyProgram: () => false,
})

const LoyaltyProgram = ({ children }: { children: JSX.Element }) => {
  const [activeLoyaltyProgram] = useLocalStorage(
    LOCAL_STORAGE_LOYALTY_PROGRAM,
    { name: '', id: '' }
  )
  const [loyaltyProgram, setLoyaltyProgram] = useState({
    name: activeLoyaltyProgram.name,
    id: activeLoyaltyProgram.id,
  })
  const [isLoyaltyProgram, setIsLoyaltyProgram] = useState(true)

  useEffect(() => {
    if (!loyaltyProgram.id) {
      setIsLoyaltyProgram(false)
    } else {
      setIsLoyaltyProgram(true)
    }
  }, [loyaltyProgram, activeLoyaltyProgram.id])

  return (
    <LoyaltyProgramContext.Provider
      value={{
        loyaltyProgram,
        setLoyaltyProgram,
        isLoyaltyProgram,
        setIsLoyaltyProgram,
      }}
    >
      {children}
    </LoyaltyProgramContext.Provider>
  )
}

export default LoyaltyProgram
