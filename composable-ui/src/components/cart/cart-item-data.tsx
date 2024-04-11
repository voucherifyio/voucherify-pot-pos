import NextLink from 'next/link'
import { useIntl } from 'react-intl'
import { APP_CONFIG } from 'utils/constants'
import { CartItem } from '@composable/types'
import { Box, Text, Stack, Image, Link } from '@chakra-ui/react'

interface CartItemDataProps {
  cartItem: CartItem
}

export const CartItemData = ({ cartItem }: CartItemDataProps) => {
  const intl = useIntl()

  return (
    <Stack direction="row" spacing={{ base: '3', md: '5' }} flexGrow={1}>
      <Link
        as={NextLink}
        href={`/product/${cartItem.slug}?id=${cartItem.id}`}
        display="flex"
        rounded="base"
      >
        <Box
          width="100px"
          height="100px"
          rounded="base"
          borderWidth="1px"
          overflow="hidden"
        >
          <Image
            fit="cover"
            src={cartItem.image_url || APP_CONFIG.IMAGE_PLACEHOLDER}
            alt={cartItem.name || ''}
            draggable="false"
            loading="lazy"
            width="full"
            height="full"
          />
        </Box>
      </Link>
      <Box maxWidth="calc(100% - 130px)">
        <Stack fontSize="sm" align="flex-start">
          <Text fontWeight="semibold">{cartItem.name}</Text>
        </Stack>
      </Box>
    </Stack>
  )
}
