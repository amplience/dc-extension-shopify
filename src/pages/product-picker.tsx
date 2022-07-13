import { arrayMove } from '@dnd-kit/sortable'
import { Card, Layout, Page } from '@shopify/polaris'
import { ContentFieldExtension } from 'dc-extensions-sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductSearch } from 'src/components/product-search'
import { SelectedProducts } from 'src/components/selected-products'
import { Product } from 'src/models/Product'

interface FieldModel {
    products: string[]
    queryString: string
}

// define the installation config parameters
interface Parameters {
    instance: {}
    installation: {
        configParam: string
    }
}

interface ProductPickerProps {
    shop: string
    hostName: string
}

const ProductPicker = ({ shop, hostName }: ProductPickerProps) => {
    const [dceSdkMounted, setDceSdkMounted] = useState(false)
    const sdkRef = useRef<ContentFieldExtension>()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    /**
     * Initializes Amplience DC SDK and stores it in ref for use
     * Sets mounted flag to allow other dependent functions to run
     *
     * @async
     * @returns {*}
     */
    async function initDceSDK() {
        const sdkImport = (await import('dc-extensions-sdk')).init
        sdkRef.current = await sdkImport<
            ContentFieldExtension<FieldModel, Parameters>
        >()
        setDceSdkMounted(true)
    }

    /**
     * Gets current value of 'product-picker' field from Amplience via DCE SDK into state
     * Fetches new product data via stored GraphQL query.
     * TODO: account for deleted product in Shopify(?)
     *
     * @async
     * @returns {*}
     */
    async function loadFieldValues() {
        const dceSdk = sdkRef.current


        if (typeof dceSdk !== 'undefined') {
            const fieldValue = (await dceSdk.field.getValue()) as FieldModel


            // queryString may not exist yet and products[] may be empty...
            if (typeof fieldValue !== 'undefined' && fieldValue.queryString && fieldValue.products.length > 0) {
                // Use saved query to fetch fresh product data
                setLoading(true)

                // DceSDK passed here because without this argument, the fetchProductsGQL
                // function loses reference to the SDK object
                const queryString  = generateQuery(fieldValue.products)
                const productData = await fetchProductsGQL(
                    queryString,
                    dceSdk,
                    'fetch-product-ids'
                )

                if (productData) setProducts(productData.products)
                setLoading(false)
            }
        }
    }

    /**
     * Fetches product data for specified ids via fetch api to nextjs endpoint
     *
     * @async
     * @returns {*}
     */
    async function fetchProductsGQL(
        productQuery: string,
        passedSdkRef?: any,
        altEndpoint?: string
    ) {
        let dceSdk = sdkRef.current
        let endpoint = 'fetch-filtered-products'
        //@ts-ignore
        let storeKey = dceSdk?.params.installation.token
        if (passedSdkRef) dceSdk = passedSdkRef
        if (altEndpoint) endpoint = altEndpoint
        if (dceSdk?.hub.id == undefined) return
        // Fetch collections
        try {
            const url = new URL(`${hostName}/api/${endpoint}`)
            url.searchParams.append('shop', shop)
            url.searchParams.append('key', storeKey)
            url.searchParams.append('hub', dceSdk.hub.id)
            url.searchParams.append('query', productQuery)

            const response = await fetch(url.toString())
            const data = await response.json()

            if (data?.products != undefined) {
                if (data?.hasNextPage != undefined)
                    return {
                        products: data.products,
                        hasNextPage: data.hasNextPage,
                    }

                if (altEndpoint) return { products: data.products }
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        // Initialize Amplience Dynamic Content SDK on first render
        initDceSDK()
    }, [])

    useEffect(() => {
        if (dceSdkMounted) {
            // Set state with present field values after SDK is initialized
            loadFieldValues()
            sdkRef.current?.frame.startAutoResizer()
        }
    }, [dceSdkMounted])

    /**
     * Handles product array updates coming from autocomplete search
     *
     * @type {*}
     */
    const handleProductsChange = useCallback(
        async (productIds, returnedProducts, setSelectedOptions) => {
            const dceSdk = sdkRef.current
            let newProducts: Product[]

            if (productIds.length > products.length) {
                // Handle product add
                const actionId = productIds[0]
                const newProduct = returnedProducts.find((product: Product) => {
                    return product.id === actionId
                }) as Product
                newProducts = [...products, newProduct]
            } else {
                // handle product remove
                newProducts = products.filter((product) => {
                    const existingIndex = productIds.findIndex(
                        (productId: string) => {
                            return productId === product.id
                        }
                    )

                    if (existingIndex > -1) return product
                })
            }

            if (typeof dceSdk !== 'undefined') {
                // Build new query to store on amplience field
                const storefrontQuery = generateStorefrontQuery(newProducts)
                await dceSdk.field.setValue({
                    products: productIds,
                    queryString: storefrontQuery,
                } as FieldModel)
                setProducts(newProducts)
                setSelectedOptions(productIds)
            }
        },
        [products]
    )

    /**
     * Handles product removal via "Remove Product" shortcut action on Selected Products
     * component.
     *
     * @type {*}
     */
    const handleRemoveProduct = useCallback(
        async (productId) => {
            const dceSdk = sdkRef.current

            const updatedProducts = products.filter((product) => {
                return product.id !== productId
            })

            const updatedProductIds = updatedProducts.map((product) => {
                return product.id
            })

            if (typeof dceSdk !== 'undefined') {
                // Build new query to store on amplience field
                const storefrontQuery = generateStorefrontQuery(updatedProducts)
                await dceSdk.field.setValue({
                    products: updatedProductIds,
                    queryString: storefrontQuery,
                } as FieldModel)
                setProducts(updatedProducts)
            }
        },
        [products]
    )

    const handleDragEnd = useCallback(
        async (event, ) => {
            const dceSdk = sdkRef.current
            const { active, over } = event

            if (active.id !== over.id) {
                setProducts((products) => {
                    const oldIndex = products.findIndex((product) => {
                        return product.id === active.id
                    })
                    const newIndex = products.findIndex((product) => {
                        return product.id === over.id
                    })

                    const newArray = arrayMove(products, oldIndex, newIndex)

                    const newProductIds = newArray.map(product => {
                        return product.id
                    })

                    if (typeof dceSdk !== 'undefined') {
                        // Build new query to store on amplience field
                        const storefrontQuery = generateStorefrontQuery(newArray)
                        dceSdk.field.setValue({
                            products: newProductIds,
                            queryString: storefrontQuery,
                        } as FieldModel)
                    }

                    return arrayMove(products, oldIndex, newIndex)
                })
            }

            
        },
        [products]
    )

    // Generates the GraphQL Query string to request products from Admin Storefront API
    // This is stored on the amplience field.
    const generateQuery : (productIds : string[]) => string = (productIds) => {
        if (productIds.length < 1) return ``
        const productQueries: string[] = []
        productIds.forEach((product, index) => {
            const query = `
                product${index}: product(id: "${product}") {
                    ...productInfo
                }
            `
            productQueries.push(query)
        })

        const gqlQuery = `query{
            ${productQueries.join('\n')}
        }
        
        
        fragment productInfo on Product {
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
        }`
        return gqlQuery
    }

    // Generates the GraphQL Query string to request products from Shopify Storefront API
    // This is stored on the amplience field.
    const generateStorefrontQuery: (products: Product[]) => {} = (
        products
    ) => {
        if (products.length < 1) return ``
        let IdStrings: string[] = []

        
        products.forEach((product) => {
            const id = product.id
            IdStrings.push(id)
            return IdStrings
        });

        const query = 
        `query ($IdArray: [ID!]!) {
            nodes(ids: $IdArray) {
              ... on Product {
                id
                title
                vendor
                priceRange {
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
                  url
                  altText
                }
              }
            }
          }`

        const variables = { "IdArray" : IdStrings }
        const graphqlQuery = {query: query, variables: variables}

        return graphqlQuery
    }

    return (
        <Page fullWidth>
            <Layout>
                <Layout.Section oneHalf>
                    <Card title="Shopify Products">
                        <Card.Section title="Select Multiple Products For Display">
                            <ProductSearch
                                products={products}
                                fetchProductsGQL={fetchProductsGQL}
                                handleProductsChange={handleProductsChange}
                            />
                        </Card.Section>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title="Selected Products">
                        <Card.Section>
                            <SelectedProducts
                                products={products}
                                loading={loading}
                                handleRemoveProduct={handleRemoveProduct}
                                handleDragEnd={handleDragEnd}
                            />
                        </Card.Section>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}

/**
 * Passes (currently) necessary info to make requests to api endpoints
 * utilizing GraphQL requests
 *
 * @async
 * @param {*} ctx
 * @returns {unknown}
 */
export const getServerSideProps = async (ctx: any) => {
    return {
        props: {
            shop: ctx.query.shop,
            hostName: process.env.HOST,
        },
    }
}

export default ProductPicker
