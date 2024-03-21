import {
  Box,
  Button,
  HStack,
  Text,
  ListItem,
  UnorderedList,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
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
            variant="ghost"
          >
            Remove
          </Button>
        )}
      </HStack>
      {loggedAsUser && session.data && (
        <TableContainer mt={6} mb={6} maxWidth={400}>
          <Table size={'sm'}>
            <Tbody>
              <Tr>
                <Td>Phone number</Td>
                <Td>{session.data.user?.phoneNumber}</Td>
              </Tr>
              {session.data.user?.name && (
                <Tr>
                  <Td>User name</Td>
                  <Td>{session.data.user?.name}</Td>
                </Tr>
              )}
              <Tr>
                <Td>Registered</Td>
                <Td
                  color={
                    session.data.user?.registeredCustomer ? 'green' : 'red'
                  }
                >
                  {' '}
                  {session.data.user?.registeredCustomer ? 'Yes' : 'No'}
                </Td>
              </Tr>
              {session.data.user?.registrationDate && (
                <Tr>
                  <Td>Registration date:</Td>
                  <Td> {session.data.user?.registrationDate}</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {!loggedAsUser && <PosBuyerSetdForm />}
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
    </>
  )
}
