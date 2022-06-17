import { EmptyState } from '@shopify/polaris'
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'

import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Product } from 'src/models/Product'

import { SortableResourceItem } from './SortableResourceItem'
const placeholderImgSrc =
    'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_small.png?format=webp'

interface SelectedProductsProps {
    products: Product[]
    handleRemoveProduct: Function
    handleDragEnd: any
    loading: boolean
}

/**
 * Renders list of selected products with removal action.
 * Pairs with Product Picker component.
 *
 * @param {SelectedProductsProps} {collections, handleSelectChange, handleDragEnd, selectedCollection}
 * @returns {*}
 */
export const SelectedProducts = ({
    products,
    handleRemoveProduct,
    handleDragEnd,
}: SelectedProductsProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={products}
                strategy={verticalListSortingStrategy}
            >
                {products.length == 0 ? (
                    <EmptyState
                        heading="Search for and Select Products to add to this list"
                        image="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_medium.png?format=webp"
                    ></EmptyState>
                ) : (
                    products.map((product, index) => (
                        <>
                            <SortableResourceItem
                                item={product}
                                index={index}
                                key={product.id}
                                id={product.id}
                                handleRemoveProduct={handleRemoveProduct}
                            />
                        </>
                    ))
                )}
            </SortableContext>
        </DndContext>
    )
}
