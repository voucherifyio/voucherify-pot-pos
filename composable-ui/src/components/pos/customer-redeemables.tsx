import {
  Button,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useCart, useCustomerRedeemables } from 'hooks'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLocalisation } from 'hooks/use-localisation'
import { Redeemable } from '@composable/types'

const filteredRedeemables = (redeemables: Redeemable[]) =>
  redeemables.filter(
    (redeemable) =>
      redeemable.object === 'voucher' && !redeemable.result?.loyalty_card
  )

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
  const { localisation } = useLocalisation()

  const loggedAsUser = !!session.data?.loggedIn
  const { status, customerRedeemables, updateCustomerRedeemablesMutation } =
    useCustomerRedeemables({
      onUpdateCustomerRedeemablesSuccess: (customerRedeemables) =>
        setVouchers(customerRedeemables),
    })

  const [vouchers, setVouchers] = useState<
    | {
        redeemables: Redeemable[]
        hasMore: boolean
        moreStartingAfter: string
      }
    | undefined
  >(undefined)
  const [page, setPage] = useState(1)

  const filteredVouchers = filteredRedeemables(vouchers?.redeemables || [])

  useEffect(() => {
    if (customerRedeemables?.redeemables?.length) {
      setVouchers(customerRedeemables)
    }
  }, [customerRedeemables])

  if (
    !loggedAsUser ||
    status !== 'success' ||
    !customerRedeemables?.redeemables ||
    !cart.id
  ) {
    return null
  }

  const addVoucherToCart = async (voucherId: string) => {
    const r = await addCartVoucher.mutate({
      cartId: cart.id!,
      code: voucherId,
    })
  }

  const handleVouchersPagination = async (
    cartId: string,
    localisation: string,
    startingAfter: string
  ) => {
    await updateCustomerRedeemablesMutation({
      cartId,
      localisation,
      startingAfter,
    })
  }

  return (
    <Flex direction={'column'} flex={1}>
      <HStack mt={4} mb={4}>
        <Text
          textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
          color={'shading.700'}
        >
          Customers coupons and promotions ({session.data?.user?.phoneNumber})
        </Text>
      </HStack>
      {filteredVouchers.length ? (
        <SimpleGrid columns={2} spacing={4}>
          {filteredVouchers?.map((voucher) => (
            <Flex
              direction={'column'}
              key={voucher.id}
              padding={'10px'}
              backgroundColor={'#f4f4f4'}
              gap={'10px'}
              borderRadius={'4px'}
            >
              <Flex direction={'column'}>
                <Text fontSize={'14px'} fontWeight={'800'}>
                  Campaign
                </Text>
                <Text fontSize={'14px'}>{voucher.campaign_name}</Text>
              </Flex>
              <Flex gap={'15px'}>
                <Text fontSize={'14px'} fontWeight={'800'}>
                  Code
                </Text>
                <Text fontSize={'14px'}>{voucher.id}</Text>
              </Flex>
              <Flex justify={'space-between'} align={'flex-end'}>
                {typeof voucher.barcodeUrl === 'string' && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image
                    style={{ cursor: 'pointer' }}
                    onClick={() => addVoucherToCart(voucher.id)}
                    src={voucher.barcodeUrl}
                    width={150}
                    height={25}
                    alt="asd"
                  />
                )}
                <Button
                  size={'sm'}
                  variant={'ghost'}
                  borderRadius={'2px'}
                  onClick={() => addVoucherToCart(voucher.id)}
                >
                  Scan
                </Button>
              </Flex>
            </Flex>
          ))}
        </SimpleGrid>
      ) : (
        <Flex>
          <Text>No active coupons or promotions</Text>
        </Flex>
      )}
      <Flex justify={'center'} mt={4} gap={'15px'}>
        {page > 1 && (
          <Button
            onClick={() => {
              handleVouchersPagination(cart.id || '', localisation, '')
              setPage(1)
            }}
          >
            First page
          </Button>
        )}
        {vouchers?.hasMore && (
          <Button
            onClick={() => {
              handleVouchersPagination(
                cart?.id || '',
                localisation,
                vouchers?.moreStartingAfter || ''
              )
              setPage(page + 1)
            }}
          >
            Next
          </Button>
        )}
      </Flex>
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
    </Flex>
  )
}
