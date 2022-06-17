import { Badge, EmptyState, ResourceItem, ResourceList, Stack, TextStyle, Thumbnail } from "@shopify/polaris";
import { Product } from "src/models/Product";
const placeholderImgSrc = "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_small.png?format=webp"
interface ProductFilterPreviewProps {
    products: Product[]
    loading: boolean
}

/**
 * Renders the list of products belonging to the parent component's selected
 * Shopify Collection.
 *
 * NOTE: Emptystate placeholder image url should probably to be one we have
 * control over.The current image src is a generic Shopify CDN placeholder
 * image.
 *
 * NOTE: Products without featured image urls currently (unintentionally)
 * render a blank media component. This should probably be swapped with a
 * working generic product placeholder image url.
 *
 * @param {ProductFilterPreviewProps} {products, loading}
 * @returns {*}
 */
export const ProductFilterPreview = ({products, loading}:ProductFilterPreviewProps) => {
    const emptyStateMarkup = products.length == 0? (
        <EmptyState
            heading="Create a filter above and click 'Preview Filter Results' to view the products returned by your filter"
            image="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_medium.png?format=webp"
        >

        </EmptyState>
    ) : undefined

    return(
        <ResourceList
            loading={loading}
            emptyState={emptyStateMarkup}
            resourceName={{singular: 'product', plural: 'products'}}
            items={products}
            renderItem={(item, id, index)=> {
                const {title, status, vendor, priceRangeV2, featuredImage} = item;
                let imgSrc, imgAlt
                if(typeof featuredImage !== undefined) {
                    imgSrc = featuredImage?.transformedSrc
                    imgAlt = featuredImage?.altText
                } else {
                    imgSrc = placeholderImgSrc
                    imgAlt = "placeholder product image"
                }

                const Capitalize = (s: string) => {
                    return s[0].toUpperCase() + s.slice(1).toLowerCase()
                }

                const truncateString = (str : string, num : number) => {
                    if(str.length <= num) {
                        return str
                    }

                    return str.slice(0, num) + '...'
                }

                return(
                    <ResourceItem id={id} url={'#'}>
                    <Stack alignment="center">
                        <Stack.Item>{index + 1}.</Stack.Item>
                        <Stack.Item>
                            <Thumbnail
                                source={imgSrc}
                                size={'small'}
                                alt={imgAlt}
                            />
                        </Stack.Item>
                        <Stack.Item fill>{truncateString(title, 30)}</Stack.Item>
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
                    </Stack>
                </ResourceItem>
                )

            }}
        />
    )
}
