import {
  Box,
  Button,
  HStack,
  Text,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { Select } from '@chakra-ui/react'

const LOCALISATIONS = [
  'West Parkland',
  'Fas Gas',
  'Parkland Calgary',
  'Husky Market',
  'Petro Canada Toronto',
  'Esso Vancouver',
  'Ultramar Montreal',
]

export const Localisation = () => {
  const session = useSession()

  const loggedAsUser = !!session.data?.loggedIn
  const localisationChange = (localisation: string) => {
    session.update({ localisation })
  }
  return (
    <>
      <Select
        value={session.data?.localisation}
        onChange={(e) => localisationChange(e.target.value)}
        placeholder="Select localisation"
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
