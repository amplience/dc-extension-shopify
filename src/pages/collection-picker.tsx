import { nodesFromEdges } from "@shopify/admin-graphql-api-utilities"
import { Card, Layout, Page } from "@shopify/polaris"
import Shopify, { RequestReturn } from "@shopify/shopify-api"
import { ContentFieldExtension } from "dc-extensions-sdk"
import { useCallback, useEffect, useRef, useState } from "react"
import { Context } from "react-apollo"
import CollectionProductPreview from "src/components/collection-preview"
import {CollectionSelect, Collection} from "src/components/collection-select"

interface FieldModel {
    id: string
    title: string
    maxLength: number
}

// define the installation config parameters
interface Parameters {
    instance: {}
    installation: {
        configParam: string
    }
}

interface CollectionQuery extends RequestReturn {
    body: {
        data: {
            collections: any
        }
    }
}

interface CollectionPickerProps {
    shop: string
    host: string
}

const CollectionPicker = ({host, shop}:CollectionPickerProps) => {
    const [dceSdkMounted, setDceSdkMounted] = useState(false)
    const sdkRef = useRef<ContentFieldExtension>()
    const [selectedCollection, setSelectedCollection] = useState('')
    const [products, setProducts] = useState([])
    const [collections, setCollections] = useState<Collection[]>();
    const [storeKey, setStoreKey] = useState('');
    const [loading, setLoading] = useState(false)

    /**
     * Initializes Amplience DC SDK and stores it in ref for use
     * Sets mounted flag to allow other dependent functions to run
     *
     * @async
     * @returns {*}
     */
    const initDceSDK = async () => {
        const sdkImport = (await import('dc-extensions-sdk')).init
        sdkRef.current = await sdkImport<ContentFieldExtension<FieldModel, Parameters>>()
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
        const dceSdk = sdkRef.current;

        if(typeof dceSdk !== "undefined") {
            const fieldValue = await dceSdk.field.getValue() as FieldModel
            if(typeof fieldValue !== 'undefined') {
                const collectionExists = collections?.findIndex((collection:Collection) => {
                    return collection.id === fieldValue.id
                })
                // Matching collection not found, skip state loading/product fetching
                if(collectionExists == -1 || collectionExists == undefined) return

                // Collection loaded into state
                setSelectedCollection(fieldValue.id)

                // Fetch collection product data
                fetchCollectionProducts(fieldValue.id)

            }
        }
    }

    /**
     * Fetches product data for specified collection via fetch api to nextjs endpoint
     *
     * @async
     * @returns {*}
     */
     async function fetchCollectionProducts(collectionId:string) {
        const dceSdk = sdkRef.current
        //@ts-ignore
        const storeKey = dceSdk?.params.installation.token;
        if(dceSdk?.hub.id == undefined) return
        // Fetch collections
        try {
            setLoading(true)
            const url = new URL(`${host}/api/fetch-collection-products`)
            url.searchParams.append("shop", shop)
            url.searchParams.append("key", storeKey)
            url.searchParams.append("hub", dceSdk.hub.id)
            url.searchParams.append("collection", collectionId)

            const response = await fetch(url.toString())
            const data = await response.json()
            if(data?.products !== undefined) {
                setProducts(data.products)
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }

    async function fetchCollections() {
        const dceSdk = sdkRef.current
        //@ts-ignore
        const storeKey = dceSdk?.params.installation.token;
        if(dceSdk?.hub.id == undefined) return
        // Fetch collections
        try {
            setLoading(true)
            const url = new URL(`${host}/api/fetch-collections`)
            url.searchParams.append("shop", shop)
            url.searchParams.append("key", storeKey)

            const response = await fetch(url.toString())
            const data = await response.json()
            if(data.collections !== undefined) {
               setCollections(data.collections);
               setLoading(false);
            }
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }

    useEffect(() => {
        // Initialize Amplience Dynamic Content SDK on first render
        initDceSDK();
    }, [])

    useEffect(() => {
        loadFieldValues();
    }, [collections])

    useEffect(() => {
        if(dceSdkMounted) {
            // Set state with present field values after SDK is initialized
            //@ts-ignore
            fetchCollections(sdkRef.current?.params.installation.token)
            //@ts-ignore
            console.log(sdkRef.current?.params.installation.token);


            sdkRef.current?.frame.startAutoResizer()
        }
    }, [dceSdkMounted])


    /**
     * Loads selected collection option(s) into Amplience field data
     *
     * @type {*}
     */
    const handleSelectChange = async (collectionId : string) => {
        const dceSdk = sdkRef.current
        setSelectedCollection(collectionId)


        if(typeof dceSdk !== "undefined") {
            const {title} = collections?.find((collection) => {
                return collection.id == collectionId
            }) as Collection
            try {
               const setValue = await dceSdk.field.setValue({
                    id:  collectionId,
                    title: title,
                    maxLength: 6
                } as FieldModel)
                console.log(setValue)
            } catch (error : any) {
                console.log(error);
            }

        }
        // Fetch new collection's products
        fetchCollectionProducts(collectionId)

    }


    return (
        <Page fullWidth>
            <Layout>
                <Layout.Section oneHalf>
                    <Card title="Shopify Collection">
                        <Card.Section title="Select a Collection">
                            <CollectionSelect
                                collections={collections}
                                handleSelectChange={handleSelectChange}
                                selectedCollection={selectedCollection}
                            />
                        </Card.Section>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title="Collection Details (Sample products)">
                        <Card.Section title="First 25 Products">
                            <CollectionProductPreview
                                products={products}
                                loading={loading}
                            />
                        </Card.Section>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>

    )
}

/**
 * Sends info needed to create extension urls
 *
 * @async
 * @param {*}
 * @returns {unknown}
 */
 export const getServerSideProps = (): unknown => ({
    props: {
        host: process.env.HOST
    }
})

export default CollectionPicker