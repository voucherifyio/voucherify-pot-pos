import { Select } from '@chakra-ui/react'
import { useLocalisation, LOCALISATIONS } from 'hooks/use-localisation'

export const Localisation = () => {
  const { localisation, updateLocalisation } = useLocalisation()
  return (
    <>
      <Select
        value={localisation}
        onChange={(e) => updateLocalisation(e.target.value)}
      >
        {LOCALISATIONS.map((local) => (
          <option key={local} value={local}>
            {local}
          </option>
        ))}
      </Select>
    </>
  )
}
