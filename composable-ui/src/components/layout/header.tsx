import { useComposable } from 'hooks'
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Link,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/router'
import { MenuItem } from 'components/menu/menu-item'
import NextLink from 'next/link'
import { Heading } from '@chakra-ui/react'
import { Localisation } from 'components/pos/localisation'
import { useContext } from 'react'
import { LoyaltyProgramContext } from 'components/pos/loyalty-pogram-context'

export const Header = () => {
  const { menuDrawer } = useComposable()
  const { pathname } = useRouter()
  const { isLoyaltyProgram, setIsLoyaltyProgram } = useContext(
    LoyaltyProgramContext
  )

  return (
    <Box as="header" borderBottomWidth="1px" height={'4rem'}>
      <Container maxW="container.2xl">
        <Grid
          templateColumns={'1fr 2fr 1fr'}
          justifyContent={'center'}
          height={'4rem'}
        >
          <Box display={{ base: 'flex', md: 'none' }}>
            <Center>
              <Button
                name="menu"
                aria-label="menu"
                width={'40px'}
                variant="unstyled"
                onClick={() =>
                  menuDrawer?.isOpen
                    ? menuDrawer.onClose()
                    : menuDrawer.onOpen()
                }
              >
                <HamburgerIcon width={'26px'} height={'26px'} />
              </Button>
            </Center>
          </Box>
          <Flex
            alignItems={'center'}
            justifyContent={{ base: 'center', md: 'left' }}
          >
            <Link as={NextLink} href="/">
              <Heading as="p" size="sm">
                Voucherify PoT
              </Heading>
            </Link>
            <Button
              type="button"
              onClick={() => {
                setIsLoyaltyProgram(false)
              }}
              marginLeft={'10px'}
            >
              Change program
            </Button>
          </Flex>
          <Box
            as="nav"
            display={{ base: 'none', md: 'flex' }}
            justifyContent="center"
          >
            <MenuItem
              label="POS"
              href={`/`}
              state={'/' === pathname ? 'Active' : 'Default'}
              rootProps={{
                height: 'full',
                disabled: isLoyaltyProgram,
              }}
            />
            <MenuItem
              label="Return Products"
              href={`/return-products`}
              state={'/return-products' === pathname ? 'Active' : 'Default'}
              rootProps={{
                height: 'full',
              }}
            />
          </Box>
          <Box
            display="flex"
            alignItems={'center'}
            justifyContent="flex-end"
            gap={3}
          >
            <Localisation />
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
