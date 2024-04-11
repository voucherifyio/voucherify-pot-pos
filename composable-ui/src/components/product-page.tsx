import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useIntl } from 'react-intl'
import { Accordion, AlertBox, Gallery, PdpLayout } from '@composable/ui'
import { useState } from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

import { APP_CONFIG } from 'utils/constants'
import { api } from 'utils/api'
import { useCart, useToast } from 'hooks'
import { Price } from './price'
import { QuantityPicker } from './quantity-picker'
import { Breadcrumb } from './product'
import { pdpAccordionData } from './product/__data__/product-accordion-data'

const DynamicNoMatchPage = dynamic(() =>
  import('./no-match-page').then((_module) => _module.NoMatchPage)
)

export const ProductPage = () => {
  const router = useRouter()
  const intl = useIntl()
  const toast = useToast()
  const { data: product, isLoading } = api.commerce.getProductBy.useQuery({
    id: `${router.query.id}`,
  })

  // TODO: breadcrumb data should come from product
  const breadcrumb = [
    { href: '/', label: 'Home' },
    {
      href: `/category/${
        product?.metadata?.category || product?.metadata?.food_category || ''
      }`,
      label:
        (product?.metadata?.category ||
          product?.metadata?.food_category ||
          '') ??
        'Category',
    },
  ]
  const [quantity, setQuantity] = useState(1)
  const { addCartItem } = useCart({
    onCartItemAddError: () => {
      toast({
        status: 'error',
        description: intl.formatMessage({
          id: 'app.failure',
        }),
      })
    },
    onCartItemAddSuccess: () => {
      toast({
        status: 'success',
        title: intl.formatMessage({ id: 'cart.title' }),
        description: intl.formatMessage(
          { id: 'cart.item.add.success' },
          { name: product?.name ?? '' }
        ),
      })
    },
  })

  const handleAddToCart = () => {
    if (!product?.id) {
      return
    }

    addCartItem.mutate({
      product,
      quantity: quantity,
    })
  }

  if (isLoading) {
    return null
  }

  if (!product) {
    return <DynamicNoMatchPage />
  }

  const phpAccordion = [...pdpAccordionData]

  return (
    <PdpLayout
      seo={<NextSeo title={product.name} />}
      breadcrumb={<Breadcrumb items={breadcrumb} />}
      title={product.name || ''}
      isLoaded={!isLoading}
      description={''}
      sectionOrder={[
        'breadcrumb',
        'brand',
        'title',
        'price',
        'main',
        'description',
        'accordion',
      ]}
      stackProps={{
        direction: { base: 'column-reverse', lg: 'row-reverse' },
      }}
      mainStackProps={{
        position: 'sticky',
        height: 'fit-content',
        top: '12',
      }}
      price={<Price price={((product?.price ?? 0) / 100)?.toString()} />}
      main={
        <>
          <HStack
            spacing={{ base: '4', md: '8' }}
            mt={4}
            align="flex-end"
            justify="space-evenly"
          >
            <Box flex="1">
              <QuantityPicker
                value={quantity}
                onChange={(val) => setQuantity(val)}
                min={1}
                max={30}
                buttonProps={{
                  size: 'sm',
                }}
              />
            </Box>
            <Box flex="1">
              <Button
                size={'lg'}
                width={'full'}
                onClick={() => handleAddToCart()}
                isLoading={addCartItem.isLoading}
              >
                {intl.formatMessage({ id: 'action.addToCart' })}
              </Button>
            </Box>
          </HStack>
          <AlertBox
            rootProps={{
              borderRadius: '0.375rem',
              mt: '1.5rem',
            }}
            description={intl.formatMessage({
              id: 'product.shippingAndReturn.info',
            })}
          />
        </>
      }
      accordion={
        <Accordion
          size="medium"
          items={phpAccordion}
          accordionProps={{
            mt: 8,
            allowToggle: false,
            allowMultiple: true,
          }}
          accordionItemProps={{ border: 'none' }}
          accordionPanelProps={{ px: 0 }}
          accordionButtonProps={{
            px: 0,
            borderBottomWidth: '1px',
          }}
        />
      }
      aside={
        <Gallery
          key={product.id}
          rootProps={{
            borderWidth: '1px',
            borderColor: 'gray.200',
            overflow: 'hidden',
            width: '100%',
            borderRadius: 'base',
          }}
          image={
            product?.image_url
              ? product.image_url
              : APP_CONFIG.IMAGE_PLACEHOLDER
          }
        />
      }
    />
  )
}
