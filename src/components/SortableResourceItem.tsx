import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Product } from 'src/models/Product'
import {
    CancelSmallMinor,
    DragHandleMinor,
    ImageMajor,
} from '@shopify/polaris-icons'
import {
    Badge,
    Button,
    Icon,
    ResourceItem,
    Stack,
    Thumbnail,
} from '@shopify/polaris'

type SortableResourceItemProps = {
    item: Product
    index: number
    id: string
    handleRemoveProduct: any
}

export const SortableResourceItem = ({
    item,
    index,
    id,
    handleRemoveProduct,
}: SortableResourceItemProps) => {
    const { title, status, priceRangeV2, featuredImage } = item

    //console.log('featuredImage', featuredImage);
    let imgSrc, imgAlt
    if (featuredImage != null && typeof featuredImage !== undefined) {
        imgSrc = featuredImage?.transformedSrc
        imgAlt = featuredImage?.altText
    } else {
        imgSrc = ImageMajor
        imgAlt = 'placeholder product image'
    }

    //console.log('imgSrc', imgSrc)

    const Capitalize = (s: string) => {
        return s[0].toUpperCase() + s.slice(1).toLowerCase()
    }
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <ResourceItem id={id} url={'#'}>
                <Stack alignment="center">
                    <Stack.Item>
                        <div
                            {...listeners}
                            {...attributes}
                            ref={setActivatorNodeRef}
                        >
                            <Icon
                                source={DragHandleMinor}
                                color={'subdued'}
                            ></Icon>
                        </div>
                    </Stack.Item>
                    <Stack.Item>{index + 1}.</Stack.Item>
                    <Stack.Item>
                        <Thumbnail
                            source={imgSrc}
                            size={'small'}
                            alt={imgAlt}
                        />
                    </Stack.Item>
                    <Stack.Item fill>{title}</Stack.Item>
                    <Stack.Item>
                        {`${priceRangeV2.minVariantPrice.amount} ${priceRangeV2.minVariantPrice.currencyCode}`}
                    </Stack.Item>
                    <Stack.Item>
                        <Badge
                            status={
                                status === 'ACTIVE' ? 'success' : 'critical'
                            }
                        >{`${Capitalize(status)}`}</Badge>
                    </Stack.Item>

                    <Button plain icon={CancelSmallMinor} onClick={() => handleRemoveProduct(id)}></Button>
                </Stack>
            </ResourceItem>
        </div>
    )
}
