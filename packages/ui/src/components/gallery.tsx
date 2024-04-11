import Image from 'next/image'
import NextLink from 'next/link'
import {
  AspectRatio,
  Box,
  Link,
  Skeleton,
  Stack,
  StackProps,
} from '@chakra-ui/react'
import { Carousel, CarouselSlide } from './carousel'

interface GalleryProps {
  aspectRatio?: number
  href?: string
  image?: string | '/img/image-placeholder.svg'
  productName?: String
  rootProps?: StackProps
}

export const Gallery = (props: GalleryProps) => {
  const { image, aspectRatio = 3 / 4, rootProps, productName = '' } = props

  if (!image) {
    return (
      <Stack spacing="4" {...rootProps}>
        <ElementLinkHandler href={props.href}>
          <AspectRatio ratio={aspectRatio} width="100%" bg="gray.200">
            <Skeleton width="100%" />
          </AspectRatio>
        </ElementLinkHandler>
      </Stack>
    )
  }

  return (
    <Stack
      display={'flex'}
      spacing="4"
      direction={{ base: 'column-reverse', md: 'row' }}
      border={'none'}
    >
      {image && (
        <Stack
          justify="center"
          flexWrap={'wrap'}
          direction={{ base: 'row', md: 'column' }}
        >
          <Box
            as={'button'}
            borderColor={'text'}
            borderRadius={'8px'}
            width={'64px'}
            height={'64px'}
          >
            <AspectRatio
              transition="all 200ms"
              ratio={1}
              margin={'2px'}
              _hover={{ opacity: 1 }}
            >
              <Image
                alt={'Product image'}
                src={image}
                width={64}
                height={64}
                style={{
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            </AspectRatio>
          </Box>
        </Stack>
      )}
      <Box
        position="relative"
        w={'full'}
        overflow={'hidden'}
        sx={{
          _hover: {
            '> button': {
              display: 'inline-flex',
            },
          },
        }}
      >
        <Carousel>
          <CarouselSlide>
            <ElementLinkHandler href={props.href}>
              <Box
                width="100%"
                position="relative"
                style={{
                  aspectRatio: '3/4',
                }}
              >
                <Image
                  fill
                  alt={`View large product image of ${image}. ${
                    image || productName
                  }`}
                  src={image}
                  sizes="(max-width: 640px) 80vw, (max-width: 768px) 70vw, (max-width: 1024px) 70vw, 50vw"
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </ElementLinkHandler>
          </CarouselSlide>
        </Carousel>
      </Box>
    </Stack>
  )
}

const ElementLinkHandler = (props: {
  children: JSX.Element
  href?: string
}) => {
  return props.href ? (
    <Link as={NextLink} href={props.href}>
      {props.children}
    </Link>
  ) : (
    props.children
  )
}
