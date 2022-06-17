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
import { ContentTypeSchema, DynamicContent, Extension } from 'dc-management-sdk-js'
import React, { useCallback, useState, useEffect, useRef } from 'react'
import {
    isAmplienceConnected,
    updateAmplienceConnect,
} from 'src/database/services/table-service'

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

            console.log(hostName)
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

    const getDcHub = async () => {
        try {
            const dcClient = await getDcClient()
            const dcHub = await dcClient.hubs.get(hubId)

            if (dcHub == undefined) {
                throw Error(
                    'Credentials are incorrect. If you forgot or lost access to your credentials, contact Amplience support.'
                )
            }

            return dcHub
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
            successRef?.current.focus({preventScroll: false})
        }
    }, [isInstalled])
    useEffect(() => {
        if (null !== errorRef.current) {
            //errorRef.current.scrollIntoView({behavior: 'smooth'});
            errorRef?.current.focus({preventScroll: false})
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
                let uuid = token?.slice(token.length - 5);

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

                const extensions = [
                    collectionPicker,
                    productPicker,
                    productFilter,
                ]

                try {
                    const newHub = await getDcHub()
                    if (newHub == undefined) return
                    try {
                        const Extensions = await newHub.related.extensions.list()
                        if (Extensions) {
                            const extensionList =
                                //@ts-ignore
                                Extensions?._embedded.extensions
                            const existingIndex = extensionList.findIndex(
                                (extension: any) =>
                                    extension.label === 'Collection Picker'
                            )
                            if (existingIndex !== -1) {
                                //fetch the existing extensions
                                extensionList.map(async (extension: any) => {
                                    const currentExtension = await newHub.related.extensions.getByName(
                                        extension.name
                                    )

                                    const updatedExtension = new Extension({
                                        parameters: `
                                            {
                                              "token": "${token}"
                                            }
                                          `,
                                    })

                                    currentExtension.related.update(updatedExtension);
                                })

                                //Set the state to installed
                                updateAmplienceConnect({
                                    shop: shop,
                                    status: true,
                                })
                                setIsInstalled(true)

                                //throw an error to let the user know the form was not submitted
                                throw Error(
                                    `Amplience Extensions are already installed on the hub: "${newHub?.name}".`
                                )
                            }
                        }
                        extensions.map((extension) => {
                            newHub.related.extensions.create(extension)
                        })

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
                        {error.message.length > 0 && (
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
                                                {"Content"}, If you would like
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
