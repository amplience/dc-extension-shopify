import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth'
import Shopify, { ApiVersion } from '@shopify/shopify-api'
import DynamoClient from '../database/dynamo-client'
import dotenv from 'dotenv'
import Koa from 'koa'
import Router from 'koa-router'
import next from 'next'

dotenv.config()

const {
    PORT,
    NODE_ENV,
    SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET,
    SCOPES,
    HOST,
} = process.env as any

const port = parseInt(PORT, 10) || 8080
const dev = NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const sessionStorage = new DynamoClient()

Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SCOPES.split(','),
    HOST_NAME: HOST.replace(/https:\/\//, ''),
    API_VERSION: ApiVersion.October21,
    IS_EMBEDDED_APP: false,
    SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
        sessionStorage.storeShopSession.bind(sessionStorage),
        sessionStorage.loadShopSession.bind(sessionStorage),
        sessionStorage.deleteShopSession.bind(sessionStorage)
    ),
})

interface ShopifyAuthContext extends Koa.Context {
    state: { shopify: { shop: string, accessToken: string, scope: string } }
}

Shopify.Webhooks.Registry.addHandler('APP_UNINSTALLED', {
    path: '/webhooks',
    webhookHandler: async (topic, shop, body) => {
        await sessionStorage.uninstallShop(shop)
    },
})

app.prepare().then(async () => {
    const server = new Koa()
    const router = new Router()
    server.keys = [Shopify.Context.API_SECRET_KEY]
    server.use(
        createShopifyAuth({
            accessMode: "offline",
            async afterAuth(ctx: ShopifyAuthContext) {
                const host = ctx.query.host
                const { shop } = ctx.state.shopify

                const response = await Shopify.Webhooks.Registry.register({
                    shop: shop,
                    accessToken: ctx.state.shopify.accessToken,
                    topic: "APP_UNINSTALLED",
                    path: "/webhooks",
                  });

                  if (!response["APP_UNINSTALLED"].success) {
                    console.log(
                      `Failed to register APP_UNINSTALLED webhook: ${response.result}`
                    )
                  }

                ctx.redirect(`/?shop=${shop}&host=${host}`)
            },
        })
    )

    const handleRequest = async (ctx: Koa.Context) => {
        await handle(ctx.req, ctx.res)
        ctx.respond = false
        ctx.res.statusCode = 200
    }

    router.post('/webhooks', async (ctx) => {
        try {
            await Shopify.Webhooks.Registry.process(ctx.req, ctx.res)
            console.log(`Webhook processed, returned status code 200`)
        } catch (error) {
            console.log(`Failed to process webhook: ${error}`)
            if (!ctx.res.headersSent) {
                ctx.res.statusCode = 500
              }
        }
    })

    router.post(
        '/graphql',
        verifyRequest({ returnHeader: true }),
        async (ctx, _next) => {
            await Shopify.Utils.graphqlProxy(ctx.req, ctx.res)
        }
    )

    router.get('/api/(.*)', async (ctx) => {
        await handle(ctx.req, ctx.res)
        ctx.respond = false
        ctx.res.statusCode = 200
    })

    router.get('(/_next/static/.*)', handleRequest)
    router.get('/_next/webpack-hmr', handleRequest)
    router.all('(.*)', async (ctx) => {
        const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res)
        const shop = session ? session.shop : ctx.query.shop as string
        shop ? await handleRequest(ctx) : ctx.redirect(`/auth?shop=${shop}`)
    })

    server.use(router.routes())
    server.use(router.allowedMethods())
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`)
    })
})
