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
} from '@chakra-ui/react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useCart, useCustomerRedeemables } from 'hooks'

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
    (redeemable) => redeemable.object === 'voucher'
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
      {vouchers?.map((voucher) => (
        <div key={voucher.id}>
          <Button onClick={() => addVoucherToCart(voucher.id)} m={2}>
            {voucher.id}
          </Button>
          <label>
            Campaign: <i>{voucher.campaign_name}</i>
          </label>
        </div>
      ))}
      {/* <pre>{JSON.stringify(customerRedeemables, null, 2)}</pre> */}

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
