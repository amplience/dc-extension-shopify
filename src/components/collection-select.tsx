import { Select } from "@shopify/polaris";

export interface Collection {
    title: string
    id: string
    productsCount: number
}

interface CollectionSelectProps {
    collections: Collection[] | undefined
    handleSelectChange: any
    selectedCollection: string
}

/**
 * Select dropdown component that renders Shopify collections as options.
 *
 * @param {CollectionSelectProps} {collections, handleSelectChange, selectedCollection}
 * @returns {*}
 */
export const CollectionSelect = ({collections, handleSelectChange, selectedCollection}:CollectionSelectProps) => {
    const options = collections?.map((collection) => {
        return {
            value: collection.id,
            label: `${collection.title} (${collection.productsCount} product${collection.productsCount > 1 ? 's' : ''})`
        }
    })
    
    return(
        <Select 
            label="Collection"
            options={options}
            onChange={handleSelectChange}
            value={selectedCollection}
        />
    )
}