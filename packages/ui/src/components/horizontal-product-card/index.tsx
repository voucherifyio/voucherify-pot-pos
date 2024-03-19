import {
  HorizontalProductCardEditable,
  HorizontalProductCardEditableProps,
} from './horizontal-product-card-editable'
import {
  HorizontalProductCardReadOnly,
  HorizontalProductCardReadOnlyProps,
} from './horizontal-product-card-read-only'

import { HorizontalProductCardEditablePosProps } from './horizontal-product-card-editable-pos'

export { HorizontalProductCardEditablePos } from './horizontal-product-card-editable-pos'
export { HorizontalProductCardEditablePomp } from './horizontal-product-card-editable-pomp'

export type HorizontalProductCardProps = (
  | HorizontalProductCardEditablePosProps
  | HorizontalProductCardEditableProps
  | HorizontalProductCardReadOnlyProps
) & {
  editable?: boolean
}

export const HorizontalProductCard = (props: HorizontalProductCardProps) => {
  const { editable } = props
  return editable ? (
    <HorizontalProductCardEditable {...props} />
  ) : (
    <HorizontalProductCardReadOnly {...props} />
  )
}
