import { Provider, useAppBridge } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'
import { Redirect } from '@shopify/app-bridge/actions'
import { AppProvider } from '@shopify/polaris'
import '../styles/global.css'
import '@shopify/polaris/dist/styles.css'
import translations from '@shopify/polaris/locales/en.json'
import ApolloClient from 'apollo-boost'
import { NextPageContext } from 'next'
import type { AppProps } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import React from 'react'

function userLoggedInFetch(ClientApplication: any) {
    const fetchFunction = authenticatedFetch(ClientApplication)

    return async (uri: string, options: RequestInit) => {
        const response = await fetchFunction(uri, options)

        if (
            response.headers.get(
                'X-Shopify-API-Request-Failure-Reauthorize'
            ) === '1'
        ) {
            const authUrlHeader = response.headers.get(
                'X-Shopify-API-Request-Failure-Reauthorize-Url'
            )

            const redirect = Redirect.create(ClientApplication)
            redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`)
            return new Response(null, { status: 302 })
        }

        return response
    }
}

// function ShopifyApolloProvider(props: { Component: React.ElementType }) {
function ShopifyApolloProvider(props: any) {

    const app = useAppBridge()
    const client = new ApolloClient({
        fetch: userLoggedInFetch(app),
        fetchOptions: {
            credentials: 'include',
        },
    })

    const Component = props.Component

    return (
        <ApolloProvider client={client}>
            <Component {...props} />
        </ApolloProvider>
    )
}

interface ShopifyAppProps extends AppProps {
    host: string
    shop: string
}

// @ts-ignore this gets replaced at compile time by webpack
const apiKey = API_KEY
const ShopifyApp = (props: ShopifyAppProps) => {
    const { Component, pageProps, host, shop } = props
    return (
        <AppProvider i18n={translations}>
            <Provider
                config={{
                    apiKey,
                    host: host,
                    forceRedirect: false,
                }}
            >
                <ShopifyApolloProvider Component={Component} shop={shop} host={host} {...pageProps} />
            </Provider>
        </AppProvider>
    )
}
// Note GetServerSide props doesn't work on _app.tsx
ShopifyApp.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
    return {
        host: ctx.query.host,
        shop: ctx.query.shop,
    }
}

export default ShopifyApp
