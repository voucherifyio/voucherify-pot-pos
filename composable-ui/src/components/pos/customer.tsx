import {
  Box,
  Button,
  HStack,
  Text,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { useSession, signIn, signOut } from 'next-auth/react'

import { PosBuyerSetdForm } from '../forms/pos-buyer-set'
import { CloseIcon } from '@chakra-ui/icons'

export const Customer = () => {
  const session = useSession()
  const loggedAsUser = !!session.data?.loggedIn
  return (
    <>
      <HStack>
        <Text
          textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
          color={'shading.700'}
        >
          Customer
        </Text>
        {loggedAsUser && (
          <Button
            size={'sm'}
            onClick={() => signOut()}
            rightIcon={<CloseIcon />}
            colorScheme="teal"
            variant="outline"
          >
            Remove
          </Button>
        )}
      </HStack>
      {loggedAsUser && (
        <Box mb={6}>
          <UnorderedList mt={6} mb={8}>
            <ListItem>
              <b>Phone number:</b> {session.data.user?.phoneNumber}
            </ListItem>
            {session.data.user?.name && (
              <ListItem>
                <b>Name:</b> {session.data.user?.name}
              </ListItem>
            )}
            <ListItem>
              <b>Registered customer:</b>{' '}
              {session.data.user?.registeredCustomer ? 'Yes' : 'No'}
            </ListItem>
            {session.data.user?.registrationDate && (
              <ListItem>
                <b>Registration date:</b> {session.data.user?.registrationDate}
              </ListItem>
            )}
          </UnorderedList>
        </Box>
      )}

      {!loggedAsUser && <PosBuyerSetdForm />}
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
    </>
  )
}
