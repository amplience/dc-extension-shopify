import { EmptyState, ResourceItem, ResourceList, TextStyle, Thumbnail } from "@shopify/polaris";
import { Product } from "src/models/Product";
import { ImageMajor } from '@shopify/polaris-icons'
//const placeholderImgSrc = "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_small.png?format=webp"

interface CollectionProductPreviewProps {
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
 * @param {CollectionProductPreviewProps} {products, loading}
 * @returns {*}
 */
const CollectionProductPreview = ({products, loading}:CollectionProductPreviewProps) => {    
    const emptyStateMarkup = products.length == 0? (
        <EmptyState
            heading="Select an available collection to preview products here"
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
            renderItem={(item)=> {
                const {id, title, status, vendor, priceRangeV2, featuredImage} = item;
                let imgSrc, imgAlt
                if(featuredImage != null && typeof featuredImage !== undefined) {
                    imgSrc = featuredImage?.transformedSrc
                    imgAlt = featuredImage?.altText
                } else {
                    imgSrc = ImageMajor
                    imgAlt = "placeholder product image"
                }
                const media = <Thumbnail 
                    source={imgSrc}
                    size={"medium"}
                    alt={imgAlt}
                />

                return(
                    <ResourceItem
                        id={id}
                        url={"#"}
                        media={media}
                    >
                        <h3>
                            <TextStyle variation="strong">{title}</TextStyle>
                        </h3>
                        <div>
                            <TextStyle>{`Starting at: ${priceRangeV2.minVariantPrice.amount} ${priceRangeV2.minVariantPrice.currencyCode}`}</TextStyle>
                        </div>
                        <div>
                            <TextStyle variation="subdued">{`Vendor: ${vendor}`}</TextStyle>
                        </div>
                        <div>
                            <TextStyle variation="subdued">{`Status: ${status}`}</TextStyle>
                        </div>
                    </ResourceItem>
                )

            }}
        />
    )
}

export default CollectionProductPreview