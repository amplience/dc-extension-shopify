import { Autocomplete, Stack, TextContainer } from "@shopify/polaris"
import { OptionDescriptor } from "@shopify/polaris/dist/types/latest/src/components/OptionList"
import { Fragment, useCallback, useEffect, useState } from "react"
import { Product } from "src/models/Product"
import { debounce } from "ts-debounce"

interface ProductSearchProps {
    products: Product[]
    fetchProductsGQL: Function
    handleProductsChange: Function
}

/**
 * Product 'Autocomplete' search component.
 * Pairs with 'Product Picker' Component.
 *
 * @param {ProductSearchProps} {products}
 * @returns {*}
 */
export const ProductSearch = ({ products, fetchProductsGQL, handleProductsChange}: ProductSearchProps) => {
    const [returnedProducts, setReturnedProducts] = useState<Product[]>([])
    const [deselectedOptions, setDeselectedOptions] = useState<OptionDescriptor[]>([])
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [inputValue, setInputValue] = useState('')
    const [options, setOptions] = useState(deselectedOptions)
    const [isLoading, setIsLoading] = useState(false)


    /**
     * Manages text input and sets appropriate states tied to text input
     * Performs search calls after user input
     *
     * @type {*}
     */
    const updateText = useCallback(async (value) => {
            setIsLoading(true)
            setInputValue(value)
            
            if (value === '' || value.length < 3) {
                setReturnedProducts([])
                setDeselectedOptions([])
                setOptions([])
                setIsLoading(false)
                return
            }

            await performSearch(value)
            
            setIsLoading(false)
            setInputValue
        },
        [deselectedOptions, options],
    )

    /**
     * Updates selected options when parent product state is modified
     * De-selects products from future searches after removal via 'selected-products' component
     *
     * @type {*}
     */
    useEffect(() => {
        // Selected options will be longer than products when trailing/missing an update
        // from other components
        if(selectedOptions.length < products.length) return
        let removedProductId = ''
        // Store removed product to properly de-select, gather selected options
        const newSelectedOptions = [...selectedOptions].filter(productId => {
            const existingIndex = products.findIndex(product => product.id === productId)
            if(existingIndex !== -1) return productId
            removedProductId = productId
        })

        // Update de-selected options
        if(removedProductId.length > 0) {
            const newDeselectedOptions = [...deselectedOptions].filter(option => option.value !== removedProductId)
            setDeselectedOptions(newDeselectedOptions)
        }

        setSelectedOptions(newSelectedOptions)
    }, [products])

    /**
     * Performs search using user input from text field to provide suggestions
     * 
     * @type {*}
     */
    const performSearch = debounce(async (value:string, currentCursor?:string) => {
            // Make request using input
            const query = currentCursor ? generateQuery(value, currentCursor) : generateQuery(value)
            const results = await fetchProductsGQL(query)
            const productOptions = results.products.map((product:Product) => { 
                return {
                    label: product.title,
                    value: product.id
                } as OptionDescriptor
            })

            const newDeselectedOptions = productOptions.filter((option:OptionDescriptor) => {
                const selectedIndex = products.findIndex(product => {
                    return product.id === option.value
                })
                
                if(selectedIndex === -1) return option
            })

            if(products.length > selectedOptions.length) {
                const selectedProducts = products.map(product => product.id)
                setSelectedOptions(selectedProducts)
            }

            setReturnedProducts(results.products)
            setDeselectedOptions(newDeselectedOptions)

            const resultOptions = productOptions
            setOptions(resultOptions)
    }, 600)

    /**
     * Generates GraphQL to request filtered products by {title contains}
     * 
     * @param {string} inputValue
     * @param {?string} [currentCursor]
     * @returns {string}
     */
    const generateQuery = (inputValue:string, currentCursor?:string) => {
        const afterParam = currentCursor ? `after:"${currentCursor}"` : ``
        const query = `{
            products(first:50 query:"${inputValue}*" ${afterParam}) {
                edges {
                    node {
                        id
                        title
                        vendor
                        status
                        priceRangeV2 {
                            maxVariantPrice {
                                amount
                                currencyCode
                            }
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                        featuredImage {
                            src
                            altText
                            transformedSrc(maxHeight: 100 preferredContentType:JPG)
                        }
                    }
                    cursor
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`

        return query
    }

    const emptyState = (
        <Fragment>
            <div style={{textAlign: 'center'}}>
                <TextContainer>{`${inputValue.length >= 3 ? 'Could not find any results' : 'Keep typing to bring up product suggestions'}`}</TextContainer>
            </div>
        </Fragment>
    );

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            label="Products"
            value={inputValue}
            placeholder="Shirt, hat, sweater"
        />
    )

    return (
        <Stack vertical>
            <Autocomplete
                allowMultiple
                options={options}
                selected={selectedOptions}
                textField={textField}
                onSelect={((selected) => {handleProductsChange(selected, returnedProducts, setSelectedOptions)})}
                listTitle="Product Search Results"
                loading={isLoading}
                emptyState={emptyState}
            />
        </Stack>
    )
}