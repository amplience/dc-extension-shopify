/* eslint-disable react-hooks/exhaustive-deps */
import {
    Card,
    Form,
    FormLayout,
    Page,
    TextField,
    Button,
    Layout,
    Banner,
    TextContainer,
    Heading,
    Spinner,
} from '@shopify/polaris'
import {
    ContentType,
    ContentTypeCachedSchema,
    ContentTypeSchema,
    DynamicContent,
    Extension,
} from 'dc-management-sdk-js'
import React, { useCallback, useState, useEffect, useRef } from 'react'
import {
    isAmplienceConnected,
    updateAmplienceConnect,
} from 'src/database/services/table-service'
import ProductPicker from './product-picker'

type props = {
    shop: string
    host: string
    hostName: string
}

const Index: React.FC<props> = ({ shop, host, hostName }: props) => {
    // App State Set
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    //Callback State
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [hubId, setHubId] = useState('')
    const [repoName, setRepoName] = useState('Content')
    const [error, setError] = useState({ message: '' })
    const [warning, setWarning] = useState('')

    //Ref
    const errorRef = useRef<HTMLHeadingElement>(null)
    const successRef = useRef<HTMLHeadingElement>(null)

    const initDbFetch = async () => {
        setStatusLoading(true)
        try {
            const dbRes = await fetch(`/api/shop-session?shop=${shop}`)
            const dbData = await dbRes.json()
            const connectionStatus = (await isAmplienceConnected({
                shop: shop,
            }))
                ? true
                : false

            if (dbData !== undefined) {
                setIsInstalled(connectionStatus)
                setToken(dbData.accessToken)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setStatusLoading(false)
        }
    }
    useEffect(() => {
        initDbFetch()
    }, [])

    const getDcClient = async () => {
        const dcClient = new DynamicContent({
            client_id: clientId,
            client_secret: clientSecret,
        })

        if (dcClient == undefined) {
            throw Error(
                'Cliend ID or Client Secret are incorrect. If you forgot or lost access to your credentials, contact Amplience support.'
            )
        }

        return dcClient
    }

    const getContentRepository = async () => {
        const dcClient = await getDcClient()
        const dcHub = await dcClient.hubs.get(hubId)

        const repositoryList = await dcHub.related.contentRepositories.list()

        const repositories =
            //@ts-ignore
            repositoryList._embedded[repositoryList.key]

        const repoNames = repositories.map((repo: any) => {
            return repo.name
        })

        const selectedRepoIndex = repoNames.indexOf(
            repoName.toLocaleLowerCase()
        )

        const selectedRepoID = repositories[selectedRepoIndex].id

        const contentRepo = await dcClient.contentRepositories.get(
            selectedRepoID
        )

        return contentRepo
    }

    const getDcHub = async () => {
        try {
            const dcClient = await getDcClient()
            const dcHub = await dcClient.hubs.get(hubId)

            //@ts-ignore
            const dct = dcClient.client.tokenProvider.token.access_token

            if (dcHub == undefined) {
                throw Error(
                    'Credentials are incorrect. If you forgot or lost access to your credentials, contact Amplience support.'
                )
            }

            return { hub: dcHub, dcToken: dct }
        } catch (err: any) {
            console.log(err)
            setError({
                message:
                    'Credentials are incorrect. If you forgot or lost access to your credentials, contact Amplience support.',
            })
        }
    }

    // App Event Handling
    useEffect(() => {
        if (null !== successRef.current) {
            //successRef.current.scrollIntoView({behavior: 'smooth'});
            successRef?.current.focus({ preventScroll: false })
        }
    }, [isInstalled])
    useEffect(() => {
        if (null !== errorRef.current) {
            //errorRef.current.scrollIntoView({behavior: 'smooth'});
            errorRef?.current.focus({ preventScroll: false })
        }
    }, [error])

    const handleSubmit = useCallback(
        (_event) => {
            //check if there are any missing fields if there are return and throw error missing fields
            if (!clientId || !hubId || !clientSecret || !repoName) {
                setError({ message: 'All fields must be filled.' })
                return
            }

            const registerExtension = async () => {
                setLoading(true)
                setError({ message: '' })
                setWarning('')
                let uuid = token?.slice(token.length - 5)
                const iconUrl =
                    'https://bigcontent.io/cms/icons/bond/bond-banner3col.png'

                const collectionPicker = new Extension({
                    name: `col-p-${uuid}`,
                    label: 'Collection Picker',
                    description: 'Pick a collection from shopify',
                    url: `${hostName}/collection-picker?shop=${shop}&host=${host}`,
                    category: 'CONTENT_FIELD',
                    height: 500,
                    parameters: `
                        {
                          "token": "${token}"
                        }
                      `,
                })
                const productFilter = new Extension({
                    name: `prod-f-${uuid}`,
                    label: 'Product Filter',
                    description:
                        'Create a ruleset to select products from shopify',
                    url: `${hostName}/product-filter?shop=${shop}&host=${host}`,
                    category: 'CONTENT_FIELD',
                    height: 500,
                    parameters: `
                        {
                          "token": "${token}"
                        }
                      `,
                })
                const productPicker = new Extension({
                    name: `prod-p-${uuid}`,
                    label: 'Product Picker',
                    description: 'Pick products from shopify',
                    url: `${hostName}/product-picker?shop=${shop}&host=${host}`,
                    category: 'CONTENT_FIELD',
                    height: 500,
                    parameters: `
                        {
                          "token": "${token}"
                        }
                      `,
                })

                const collectionPickerContentType = new ContentType({
                    contentTypeUri: `${hostName}/api/schemas/collection-picker`,
                    settings: {
                        label: 'Shopify collection picker',
                        icons: [
                            {
                                size: 256,
                                url: iconUrl,
                            },
                        ],
                        visualizations: [
                            {
                                label: 'Example Visualization',
                                templatedUri: `${hostName}/visualization?shop=${shop}&host=${host}&vse={{vse.domain}}&content={{content.sys.id}}&contentType=collection-picker`,
                                default: true,
                            },
                        ],
                    },
                })

                const ProductPickerContentType = new ContentType({
                    contentTypeUri: `${hostName}/api/schemas/product-picker`,
                    settings: {
                        label: 'Shopify product picker',
                        icons: [
                            {
                                size: 256,
                                url: iconUrl,
                            },
                        ],
                        visualizations: [
                            {
                                label: 'Example Visualization',
                                templatedUri: `${hostName}/visualization?shop=${shop}&host=${host}&vse={{vse.domain}}&content={{content.sys.id}}&contentType=product-picker`,
                                default: true,
                            },
                        ],
                    },
                })

                const ProductFilterContentType = new ContentType({
                    contentTypeUri: `${hostName}/api/schemas/product-filter`,
                    settings: {
                        label: 'Shopify product filter',
                        icons: [
                            {
                                size: 256,
                                url: iconUrl,
                            },
                        ],
                        visualizations: [
                            {
                                label: 'Example Visualization',
                                templatedUri: `${hostName}/visualization?shop=${shop}&host=${host}&vse={{vse.domain}}&content={{content.sys.id}}&contentType=product-filter`,
                                default: true,
                            },
                        ],
                    },
                })

                const extensions = [
                    collectionPicker,
                    productPicker,
                    productFilter,
                ]

                const contentTypes = [
                    ProductPickerContentType,
                    ProductFilterContentType,
                    collectionPickerContentType,
                ]

                try {
                    const newHub = await getDcHub()
                    if (newHub == undefined) return

                    //
                    try {
                        //Check if the Extensions are already created in the amplience dashboard
                        const Extensions = await newHub.hub.related.extensions.list()
                        if (Extensions.page!.totalElements! > 0) {
                            const extensionList =
                                //@ts-ignore
                                Extensions?._embedded.extensions
                            let selectedExtensions: any = []
                            const existingIndex = extensionList.map(
                                (extension: any) => {
                                    if (
                                        extension.label ==
                                            'Collection Picker' ||
                                        extension.label == 'Product Picker' ||
                                        extension.label == 'Product Filter'
                                    ) {
                                        selectedExtensions.push(extension)
                                    }
                                    return selectedExtensions
                                }
                            )

                            
                            if (selectedExtensions.length > 0) {
                                //throw a warning to let the user know the form was not submitted
                                setWarning(
                                    `Amplience Extensions are already installed on the hub: "${newHub?.hub.name}".`
                                )

                                //fetch the existing extensions
                                selectedExtensions.map(
                                    async (extension: any) => {
                                        const currentExtension = await newHub.hub.related.extensions.getByName(
                                            extension.name
                                        )

                                        const oldUuid = extension.name.slice(
                                            extension.name.length - 5
                                        )
                                        const name = extension.name.replace(
                                            oldUuid,
                                            uuid
                                        )

                                        const updatedExtension = new Extension({
                                            name: name,
                                            parameters: `
                                            {
                                              "token": "${token}"
                                            }
                                          `,
                                        })

                                        currentExtension.related.update(
                                            updatedExtension
                                        )
                                    }
                                )
                            } else {
                                extensions.map((extension) => {
                                    newHub.hub.related.extensions.create(extension)
                                })
                            }

                            //Set the state to installed
                            updateAmplienceConnect({
                                shop: shop,
                                status: true,
                            })
                            setIsInstalled(true)

                        } else {
                            extensions.map((extension) => {
                                newHub.hub.related.extensions.create(extension)
                            })

                        }

                        //get correct schemas from the api endpoints
                        const collectionSchemaReq = await fetch(
                            `/api/schemas/collection-picker?shop=${shop}`
                        )
                        const collectionSchemaRes = JSON.stringify(
                            await collectionSchemaReq.json(),
                            null,
                            '\t'
                        )
                        const pickerSchemaReq = await fetch(
                            `/api/schemas/product-picker?shop=${shop}`
                        )
                        const pickerSchemaRes = JSON.stringify(
                            await pickerSchemaReq.json(),
                            null,
                            '\t'
                        )
                        const filterSchemaReq = await fetch(
                            `/api/schemas/product-filter?shop=${shop}`
                        )
                        const filterSchemaRes = JSON.stringify(
                            await filterSchemaReq.json(),
                            null,
                            '\t'
                        )

                        const collectionSchemaId = `${hostName}/api/schemas/collection-picker`
                        const pickerSchemaId = `${hostName}/api/schemas/product-picker`
                        const filterSchemaId = `${hostName}/api/schemas/product-filter`

                        const collectionPickerSchema = new ContentTypeSchema({
                            validationLevel: 'CONTENT_TYPE',
                            body: collectionSchemaRes,
                            schemaId: collectionSchemaId,
                        })
                        const productPickerSchema = new ContentTypeSchema({
                            validationLevel: 'CONTENT_TYPE',
                            body: pickerSchemaRes,
                            schemaId: pickerSchemaId,
                        })
                        const productFilterSchema = new ContentTypeSchema({
                            validationLevel: 'CONTENT_TYPE',
                            body: filterSchemaRes,
                            schemaId: filterSchemaId,
                        })

                        const schemas = [
                            {
                                schema: collectionPickerSchema,
                                id: 'collection-picker',
                            },
                            {
                                schema: productPickerSchema,
                                id: 'product-picker',
                            },
                            {
                                schema: productFilterSchema,
                                id: 'product-filter',
                            },
                        ]

                        const updateSchema = async () => {
                            //check to see if there are any schemas
                            const fetchReq = await fetch(
                                `https://api.amplience.net/v2/content/hubs/${hubId}/content-type-schemas/`,
                                {
                                    method: 'GET',
                                    headers: {
                                        Authorization: `Bearer ${newHub.dcToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                            const fetchRes = await fetchReq.json()

                            //new array to store schemas we have created
                            interface Schemas {
                                cts: ContentTypeSchema
                                label: string
                            }
                            let selectedSchema: Schemas[] = []

                            //map through schemas & find matching schemas to the ones we created
                            fetchRes?._embedded[
                                //@ts-ignore
                                'content-type-schemas'
                            ].map((cts: any) => {
                                if (
                                    cts.schemaId ==
                                        `${hostName}/api/schemas/collection-picker` ||
                                    cts.schemaId ==
                                        `${hostName}/api/schemas/product-picker` ||
                                    cts.schemaId ==
                                        `${hostName}/api/schemas/product-filter`
                                ) {
                                    const label = cts.schemaId.replace(
                                        `${hostName}/api/schemas/`,
                                        ''
                                    )
                                    selectedSchema.push({
                                        cts: cts,
                                        label: label,
                                    })
                                }
                                return selectedSchema
                            })

                            //map through the selected schemas and update them with the most recent fetch to the schema api
                            selectedSchema.map(async (schema) => {
                                const updatePatchURL = `https://api.amplience.net/v2/content/content-type-schemas/${
                                    schema.cts!.id
                                }`
                                //using the id as a key select the correct body to deliver to the patch.
                                const updatedBody =
                                    schemas[
                                        schemas
                                            .map((body) => {
                                                return body.id
                                            })
                                            .indexOf(schema.label)
                                    ]

                                const patchReq = await fetch(updatePatchURL, {
                                    method: 'PATCH',
                                    headers: {
                                        Authorization: `Bearer ${newHub.dcToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        body: updatedBody.schema.body,
                                    }),
                                })
                                const patchRes = await patchReq.json()
                                return patchRes
                            })

                            if (fetchReq.ok) {
                                return fetchRes
                            }

                            const responseError = {
                                type: 'Error',
                                message: fetchRes.message || 'Duplicate',
                            }

                            let error = new Error()
                            error = { ...error, ...responseError }
                            throw error
                        }

                        const createSchemas = async () => {
                            schemas.map(async (schema) => {
                                try {
                                    const fetchReq = await fetch(
                                        `https://api.amplience.net/v2/content/hubs/${hubId}/content-type-schemas`,
                                        {
                                            method: 'POST',
                                            headers: {
                                                Authorization: `Bearer ${newHub.dcToken}`,
                                                'Content-Type':
                                                    'application/json',
                                            },
                                            body: JSON.stringify(schema.schema),
                                        }
                                    )
                                    const fetchRes = await fetchReq.json()

                                    if (fetchReq.ok) {
                                        return fetchRes
                                    }

                                    const responseError = {
                                        type: 'Error',
                                        message:
                                            fetchRes.message ||
                                            'Content Type already exists',
                                    }

                                    let error = new Error()
                                    error = { ...error, ...responseError }
                                    throw error
                                } catch (err: any) {
                                    updateSchema()
                                }
                            })
                        }

                        createSchemas()

                        // Get the user selected repository
                        const contentRepo = await getContentRepository()
                        //Check if the Content Types are already created in the amplience dashboard
                        let ContentTypes = await newHub.hub.related.contentTypes.list()
                        if (ContentTypes.page!.totalElements! > 0) {
                            const contentTypeList =
                                //@ts-ignore
                                ContentTypes?._embedded[
                                    //@ts-ignore
                                    ContentTypes.key
                                ]

                            //find content types matching our schemas uri store them in an array to use later
                            interface ContentTypes {
                                type: ContentType
                                label: string
                            }

                            let selectedTypes: ContentTypes[] = []
                            contentTypeList.map((ct: any) => {
                                if (
                                    ct.contentTypeUri ==
                                        `${hostName}/api/schemas/collection-picker` ||
                                    ct.contentTypeUri ==
                                        `${hostName}/api/schemas/product-picker` ||
                                    ct.contentTypeUri ==
                                        `${hostName}/api/schemas/product-filter`
                                ) {
                                    const label = ct.contentTypeUri.replace(
                                        `${hostName}/api/schemas/`,
                                        ''
                                    )
                                    selectedTypes.push({
                                        type: ct,
                                        label: label,
                                    })
                                }
                                return selectedTypes
                            })

                            //if we have matching types then assign those to the user selected
                            if (selectedTypes.length > 0) {
                                //fetch the existing extensions and assign them to the selected repo
                                selectedTypes.map(async (ct) => {
                                    contentRepo.related.contentTypes.assign(
                                        ct.type!.id!
                                    )
                                    const contentType = await newHub.hub.related.contentTypes.get(
                                        ct.type!.id!
                                    )
                                    contentType.related.update(
                                        new ContentType({
                                            contentTypeUri: `${hostName}/api/schemas/${ct.label}`,
                                            settings: {
                                                label:
                                                    'Shopify ' +
                                                    ct.label.replace('-', ' '),
                                                icons: [
                                                    {
                                                        size: 256,
                                                        url: iconUrl,
                                                    },
                                                ],
                                                visualizations: [
                                                    {
                                                        label:
                                                            'Example Visualization',
                                                        templatedUri: `${hostName}/visualization?shop=${shop}&host=${host}&vse={{vse.domain}}&content={{content.sys.id}}&contentType=${ct.label}`,
                                                        default: false,
                                                    },
                                                ],
                                            },
                                        })
                                    )
                                    
                                    const updatedcachedSchema = new ContentTypeCachedSchema()
                                    await contentType.related.contentTypeSchema.update(
                                        updatedcachedSchema
                                    )
                                })
                            } else {
                                contentTypes.map(async (contentType) => {
                                    await newHub.hub.related.contentTypes
                                        .register(contentType)
                                        .then(async (res) => {
                                            await contentRepo.related.contentTypes.assign(
                                                res.id!
                                            )
                                        })
                                })
                            }
                        } else {
                            contentTypes.map(async (contentType) => {
                                await newHub.hub.related.contentTypes
                                    .register(contentType)
                                    .then(async (res) => {
                                        await contentRepo.related.contentTypes.assign(
                                            res.id!
                                        )
                                    })
                            })
                        }

                        updateAmplienceConnect({ shop: shop, status: true })
                        setIsInstalled(true)
                    } catch (err: any) {
                        setError(err)
                    }
                } catch (err: any) {
                    console.log(err)
                    setError(err)
                } finally {
                    setLoading(false)
                }
            }

            registerExtension()
        },
        [clientId, clientSecret, hubId, repoName]
    )
    const handleClientIdChange = useCallback(
        (value: string) => setClientId(value),
        [clientId]
    )
    const handleClientSecretChange = useCallback(
        (value: string) => setClientSecret(value),
        [clientSecret]
    )
    const handleHubIdChange = useCallback((value: string) => setHubId(value), [
        hubId,
    ])
    const handleRepoNameChange = useCallback(
        (value: string) => setRepoName(value),
        [repoName]
    )

    const isValueInvalid = (content: any, label: string) => {
        if (!content) {
            return `${label} is required`
        } else {
            return ''
        }
    }

    return (
        <Page narrowWidth>
            <Layout>
                <Layout.Section>
                    <TextContainer>
                        <Heading>About Amplience</Heading>
                        <p>
                            The Amplience app allows editors to select products
                            and collections from this shopify store and
                            reference them inside of Amplience.
                        </p>
                    </TextContainer>
                </Layout.Section>
                <Layout.Section>
                    <Card
                        title="Integration Status"
                        //secondaryFooterActions={isInstalled ? [{content: 'Uninstall extensions', destructive: true}] : [{content: ''}]}
                    >
                        <Card.Section>
                            {statusLoading ? (
                                <div className="mx-auto">
                                    <Spinner
                                        accessibilityLabel="Spinner example"
                                        size="small"
                                    />
                                </div>
                            ) : isInstalled ? (
                                <Banner
                                    ref={successRef}
                                    title="Amplienece Extensions Installed"
                                    status="success"
                                >
                                    <p>
                                        To access your extentions log into your
                                        Dynamic Content dashboard.
                                    </p>
                                </Banner>
                            ) : (
                                <Banner
                                    title="Amplienece Extensions Not Installed"
                                    status="warning"
                                >
                                    <p>
                                        To install the extensions fill out the
                                        form below.
                                    </p>
                                </Banner>
                            )}
                        </Card.Section>
                    </Card>
                    <div className="success"></div>
                </Layout.Section>
                <Layout.Section>
                    <Card title="Configuration">
                        {error?.message?.length > 0 && (
                            <Card.Section>
                                <Banner
                                    ref={errorRef}
                                    title="Error"
                                    status="critical"
                                    onDismiss={() => {
                                        setError({ message: '' })
                                    }}
                                >
                                    <p>
                                        Something went wrong trying to install
                                        extentions:
                                    </p>
                                    <span>{error.message}</span>
                                </Banner>
                            </Card.Section>
                        )}
                        {warning?.length > 0 && (
                            <Card.Section>
                                <Banner
                                    ref={errorRef}
                                    title="Warning"
                                    status="warning"
                                    onDismiss={() => {
                                        setWarning('')
                                    }}
                                >
                                    <span>{warning}</span>
                                </Banner>
                            </Card.Section>
                        )}
                        <Card.Section>
                            <Form noValidate onSubmit={handleSubmit}>
                                <FormLayout>
                                    <TextField
                                        value={clientId}
                                        onChange={handleClientIdChange}
                                        label="Client ID"
                                        error={isValueInvalid(
                                            clientId,
                                            'Client ID'
                                        )}
                                        type="text"
                                        autoComplete="false"
                                        helpText={
                                            <span>
                                                Your Client Secret and ID are
                                                sent to you by an Amplience
                                                Associate. Please refer to that
                                                documentation.
                                            </span>
                                        }
                                    />
                                    <TextField
                                        value={clientSecret}
                                        onChange={handleClientSecretChange}
                                        label="Client Secret"
                                        error={isValueInvalid(
                                            clientSecret,
                                            'Client Secret'
                                        )}
                                        type="password"
                                        helpText={
                                            <span>
                                                Your Client Secret and ID are
                                                sent to you by an Amplience
                                                Associate. Please refer to that
                                                documentation.
                                            </span>
                                        }
                                    />
                                    <TextField
                                        value={hubId}
                                        onChange={handleHubIdChange}
                                        label="Hub ID"
                                        error={isValueInvalid(hubId, 'Hub ID')}
                                        type="text"
                                        helpText={
                                            <span>
                                                Your Hub ID is found in your
                                                Dynamic Content dashboard under
                                                properties
                                            </span>
                                        }
                                    />
                                    <TextField
                                        value={repoName}
                                        onChange={handleRepoNameChange}
                                        label="Content Repository Name"
                                        error={isValueInvalid(
                                            repoName,
                                            'Content Repository Name'
                                        )}
                                        type="text"
                                        helpText={
                                            <span>
                                                The default repository name is
                                                {'Content'}, If you would like
                                                your extensions to be installed
                                                on another repository, enter
                                                that new name here.
                                            </span>
                                        }
                                    />
                                    <Button
                                        submit={!loading}
                                        loading={loading}
                                        primary
                                    >
                                        Install Extensions
                                    </Button>
                                </FormLayout>
                            </Form>
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
        hostName: process.env.HOST,
    },
})

export default Index
