import {
  Box,
  Button,
  HStack,
  Text,
  ListItem,
  UnorderedList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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
import { useCart, useCustomerRedeemables } from 'hooks'
import Image from 'next/image'
import { PosBuyerSetdForm } from '../forms/pos-buyer-set'
import { CloseIcon } from '@chakra-ui/icons'
import { useRef, useState } from 'react'

export const CustomerRedeemable = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [addVoaddVoucherError, setAddsVoucherError] = useState<
    boolean | string
  >(false)

  const session = useSession()
  const { cart, addCartVoucher } = useCart({
    onCartVoucherAddSuccess(data, variables, context) {
      if (data.success) {
        setAddsVoucherError(false)
      } else {
        setAddsVoucherError(data.errorMessage || true)
      }
      onOpen()
    },
  })

  const loggedAsUser = !!session.data?.loggedIn
  const { status, customerRedeemables } = useCustomerRedeemables()

  if (
    !loggedAsUser ||
    status !== 'success' ||
    !customerRedeemables ||
    !cart.id
  ) {
    return null
  }

  const vouchers = customerRedeemables.filter(
    (redeemable) =>
      redeemable.object === 'voucher' && !redeemable?.result?.loyalty_card
  )

  const addVoucherToCart = async (voucherId: string) => {
    const r = await addCartVoucher.mutate({
      cartId: cart.id!,
      code: voucherId,
    })
  }

  return (
    <>
      <HStack mt={12}>
        <Text
          textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
          color={'shading.700'}
        >
          Customers coupons and promotions ({session.data?.user?.phoneNumber})
        </Text>
      </HStack>
      <TableContainer mt={6} mb={6}>
        <Table variant="simple" size={'sm'}>
          <Thead>
            <Tr>
              <Th>Campaign</Th>
              <Th>Code</Th>
              <Th>Barcode</Th>
              <Th isNumeric>Scan</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vouchers?.map((voucher) => (
              <Tr key={voucher.id}>
                <Td>{voucher.campaign_name || '- - - '}</Td>
                <Td> {voucher.id}</Td>
                <Td>
                  {typeof voucher.barcodeUrl === 'string' && (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image
                      style={{ cursor: 'pointer' }}
                      onClick={() => addVoucherToCart(voucher.id)}
                      src={voucher.barcodeUrl}
                      width={200}
                      height={25}
                      alt="asd"
                    />
                  )}
                </Td>

                <Td isNumeric>
                  <Button
                    size={'sm'}
                    variant={'ghost'}
                    onClick={() => addVoucherToCart(voucher.id)}
                  >
                    Scan
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {/* <pre>{JSON.stringify(vouchers, null, 2)}</pre> */}

      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {addVoaddVoucherError === false
                ? 'Voucher added 👏'
                : addVoaddVoucherError === true
                ? 'Could not add voucher to cart ❌'
                : addVoaddVoucherError}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    </>
  )
}
