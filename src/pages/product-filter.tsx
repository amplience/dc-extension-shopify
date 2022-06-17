import {
    Button,
    Card,
    Layout,
    Page,
    ResourceItem,
    Stack,
    TextContainer,
} from '@shopify/polaris'
import { TextField } from '@shopify/polaris/dist/types/latest/src/components/Autocomplete/components'
import { ContentFieldExtension } from 'dc-extensions-sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Comparators,
    Condition,
    FilterParams,
    Modifier,
    ProductFilterConditions,
} from 'src/components/product-filter-conditions'
import { ProductFilterPreview } from 'src/components/product-filter-preview'

interface FieldModel {
    queryString: string
    rawConditions: Condition[]
    maxLength: number
}

// define the installation config parameters
interface Parameters {
    instance: {}
    installation: {
        configParam: string
    }
}

interface ProductFilterProps {
    shop: string
    hostName: string
}

const ConditionTemplate: Condition = {
    modifier: '' as Modifier,
    field: 'title' as keyof typeof FilterParams,
    value: '*',
    valueInput: '',
    filterName: 'contains',
    filterIndex: 0,
    filterComparator: Comparators.EQUALS,
    applyFilter: FilterParams.title.filters[0].apply,
}

const ProductFilter = ({ shop, hostName }: ProductFilterProps) => {
    const [dceSdkMounted, setDceSdkMounted] = useState(false)
    const sdkRef = useRef<ContentFieldExtension>()
    const [conditions, setConditions] = useState([{ ...ConditionTemplate }])
    const [query, setQuery] = useState('')
    const [products, setProducts] = useState([])
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
     * Gets current value of 'collection' field from Amplience via DCE SDK into state
     * Loads product data via fetchCollectionProducts
     *
     * @async
     * @returns {*}
     */
    async function loadFieldValues() {
        const dceSdk = sdkRef.current
        if (typeof dceSdk !== 'undefined') {
            const fieldValue = (await dceSdk.field.getValue()) as FieldModel
            if (
                typeof fieldValue !== 'undefined' &&
                fieldValue.rawConditions.length > 0
            ) {
                // Load conditions into product-filter-conditions forms
                const rawConditions = fieldValue.rawConditions
                rawConditions.forEach((condition, index) => {
                    // Re-apply condition filter functions as they cannot be saved to the field directly
                    if (
                        typeof condition.applyFilter === 'undefined' &&
                        typeof condition.filterIndex !== 'undefined'
                    ) {
                        condition.applyFilter =
                            FilterParams[condition.field].filters[
                                condition.filterIndex
                            ].apply
                    }
                })
                setConditions(fieldValue.rawConditions)
                setQuery(fieldValue.queryString)
                fetchProductQuery(generateQuery(fieldValue.rawConditions))
            } else {
                setQuery(generateQuery(conditions))
            }
        }
    }

    /**
     * Fetches result of query built using current filter conditions.
     *
     * @async
     * @param {string} query
     * @returns {*}
     */
    async function fetchProductQuery(query: string) {
        const dceSdk = sdkRef.current
        //@ts-ignore
        let storeKey = dceSdk?.params.installation.token
        if (dceSdk?.hub.id == undefined) return
        // Fetch products
        try {
            setLoading(true)
            const url = new URL(`${hostName}/api/fetch-filtered-products`)
            url.searchParams.append('shop', shop)
            url.searchParams.append('key', storeKey)
            url.searchParams.append('hub', dceSdk.hub.id)
            url.searchParams.append('query', query)

            const response = await fetch(url.toString())
            const data = await response.json()

            if (data?.products !== undefined) {
                setProducts(data.products)
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
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
     * Stage current state of app for saving to amplience field via SDK
     *
     * @async
     * @param {*} dceSdk
     * @param {Condition[]} newConditions
     * @returns {*}
     */
    async function setDceFieldValues(dceSdk: any, newConditions: Condition[]) {
        // Remove function references as they are not cloneable for saving to the field value
        const savedConditions = newConditions.map((condition) => {
            return {
                ...condition,
                applyFilter: undefined,
            }
        })

        if (typeof dceSdk !== 'undefined') {
            await dceSdk.field.setValue({
                queryString: generateStoreFrontQuery(newConditions),
                rawConditions: savedConditions,
            } as FieldModel)
        }
    }

    /**
     * Ensures conditions state object is properly copied for mutability
     *
     * @param {Condition[]} conditions
     * @returns {{}}
     */
    function deepCopyConditions(conditions: Condition[]) {
        const newConditions = [...conditions]
        newConditions.forEach((condition, index) => {
            condition.applyFilter = conditions[index].applyFilter
        })

        return newConditions
    }

    /**
     * Updates form when field is switched so that proper filters are made
     * available for the selected field type
     *
     * @type {*}
     */
    const handleFieldChange = useCallback(
        async (value, conditionIndex) => {
            const dceSdk = sdkRef.current

            // Set new condition field
            const newConditions = deepCopyConditions(conditions)
            const newField = value as keyof typeof FilterParams
            newConditions[conditionIndex].field = newField
            // newConditions[conditionIndex].filter = FilterParams[newField].filters[0]
            newConditions[conditionIndex] = {
                ...newConditions[conditionIndex],
                filterName: FilterParams[newField].filters[0].name,
                filterComparator: FilterParams[newField].filters[0].comparator,
                applyFilter: FilterParams[newField].filters[0].apply,
                filterIndex: 0,
            }
            // Update state & amplience field values
            setConditions(newConditions)
            setQuery(generateQuery(conditions))
            fetchProductQuery(generateQuery(conditions))
            await setDceFieldValues(dceSdk, newConditions)
        },
        [conditions]
    )

    /**
     * Updates filter functions to properly format the value input by the user
     *
     * @type {*}
     */
    const handleConditionChange = useCallback(
        async (value, conditionIndex) => {
            const dceSdk = sdkRef.current

            const newConditions = deepCopyConditions(conditions)
            const field = newConditions[conditionIndex].field

            // Set new filter for condition
            newConditions[conditionIndex] = {
                ...newConditions[conditionIndex],
                filterName: FilterParams[field].filters[value].name,
                filterComparator: FilterParams[field].filters[value].comparator,
                applyFilter: FilterParams[field].filters[value].apply,
                filterIndex: value,
            }

            const applyNewFilter = newConditions[conditionIndex].applyFilter
            if (typeof applyNewFilter !== 'undefined') {
                newConditions[conditionIndex].value = applyNewFilter(
                    newConditions[conditionIndex].value
                )
            }
            // Update state & amplience field values
            setConditions(newConditions)
            setQuery(generateQuery(conditions))
            fetchProductQuery(generateQuery(conditions))
            await setDceFieldValues(dceSdk, newConditions)
        },
        [conditions]
    )

    /**
     * Updates text input at end of condition form
     *
     * @type {*}
     */
    const handleValueChange = useCallback(
        async (value, conditionIndex) => {
            const dceSdk = sdkRef.current
            // Set new conditions
            const newConditions = deepCopyConditions(conditions)
            const conditionFilter = conditions[conditionIndex].applyFilter

            newConditions[conditionIndex].valueInput = value
            if (conditionFilter) {
                newConditions[conditionIndex].value = conditionFilter(value)
            }
            // Update state & amplience field values
            setConditions(newConditions)
            setQuery(generateQuery(conditions))
            fetchProductQuery(generateQuery(conditions))
            await setDceFieldValues(dceSdk, newConditions)
        },
        [conditions]
    )

    /**
     * Deletes conditions from state, removes from current field value
     *
     * @type {*}
     */
    const handleDeleteCondition = useCallback(
        async (conditionIndex) => {
            const index = parseInt(conditionIndex)
            const dceSdk = sdkRef.current
            // Set new conditions
            const newConditions = deepCopyConditions(conditions)
            newConditions.splice(index, 1)
            // Update state & amplience field values
            setConditions(newConditions)
            setQuery(generateQuery(newConditions))
            fetchProductQuery(generateQuery(newConditions))
            await setDceFieldValues(dceSdk, newConditions)
        },
        [conditions]
    )

    /**
     * Adds a new row for condition input
     *
     * @async
     * @returns {*}
     */
    const handleAddCondition = useCallback(() => {
        const newConditions = deepCopyConditions(conditions)
        const addedCondition = { ...ConditionTemplate }
        // Default to first available filter function for condition field
        addedCondition.applyFilter =
            FilterParams[addedCondition.field].filters[0].apply
        newConditions.push(addedCondition)
        setConditions(newConditions)
    }, [conditions])

    const generateQuery: (conditions: Condition[]) => string = (conditions) => {
        let connective = conditions.length > 1 ? true : false
        let searchTerms = conditions.reduce((searchTerms, condition, index) => {
            // Set up field and modifier (if present)
            // TODO: Modifier options
            let newTerm = `${condition.modifier ? condition.modifier : ''}${
                condition.field
            }`
            // Set up comparator and value
            newTerm = newTerm.concat(
                `${condition.filterComparator}${condition.value}`
            )

            //TODO: Set up different connectives (defaults to AND)
            if (connective && index < conditions.length - 1)
                newTerm = newTerm.concat(` AND `)
            // Condition complete and appended to search terms
            return searchTerms.concat(newTerm)
        }, '') as string

        const gqlQuery = `{
            products(first:25 query:"${searchTerms}") {
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
                }
            }
        }`
        return gqlQuery
    }

    const generateStoreFrontQuery: (conditions: Condition[]) => string = (conditions) => {
        let connective = conditions.length > 1 ? true : false
        let searchTerms = conditions.reduce((searchTerms, condition, index) => {
            // Set up field and modifier (if present)
            // TODO: Modifier options
            let newTerm = `${condition.modifier ? condition.modifier : ''}${
                condition.field
            }`
            // Set up comparator and value
            newTerm = newTerm.concat(
                `${condition.filterComparator}${condition.value}`
            )

            //TODO: Set up different connectives (defaults to AND)
            if (connective && index < conditions.length - 1)
                newTerm = newTerm.concat(` AND `)
            // Condition complete and appended to search terms
            return searchTerms.concat(newTerm)
        }, '') as string

        const gqlQuery = `{
            products(first:25 query:"${searchTerms}") {
                edges {
                    node {
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
            }
        }`
        return gqlQuery
    }

    return (
        <Page fullWidth>
            <Layout>
                <Layout.Section>
                    <Card title="Product Filters">
                        <Card.Section>
                            <TextContainer>
                                Create filters to query products from your store
                                by.
                            </TextContainer>
                        </Card.Section>
                        <Card.Section title="Create a Filter">
                            <Card.Subsection>
                                <p className='my-10'>Products must match all conditions</p>
                            </Card.Subsection>
                            <ProductFilterConditions
                                conditions={conditions}
                                handleFieldChange={handleFieldChange}
                                handleConditionChange={handleConditionChange}
                                handleValueChange={handleValueChange}
                                handleDeleteCondition={handleDeleteCondition}
                                handleAddCondition={handleAddCondition}
                            />
                        </Card.Section>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card
                        title="Filter Preview"
                    >
                        <Card.Section>
                            <TextContainer>
                                <Card.Subsection>
                                    <ProductFilterPreview
                                        products={products}
                                        loading={loading}
                                    />
                                </Card.Subsection>
                            </TextContainer>
                        </Card.Section>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}

/**
 * Sends info needed to make requests from Amplience extension iframe
 *
 * @async
 * @param {*} ctx
 * @returns {unknown}
 */
export const getServerSideProps = async (ctx: any) => {
    /**
     * NOTE: This type of info (keys) should be passed to the Amplience installation parameter instead of here.
     * https://amplience.com/docs/development/registeringextensions.html#installationparams
     */

    return {
        props: {
            shop: ctx.query.shop,
            hostName: process.env.HOST,
        },
    }
}

export default ProductFilter
