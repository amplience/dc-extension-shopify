import { UpdateCommand } from '@aws-sdk/lib-dynamodb'

import DynamoClient from '../dynamo-client'

const shopModel = new DynamoClient()

/**
 * Utility function to invoke `updateAmplienceConnect` (below).
 * @param {string} shop // Name of Shop i.e. store.myshopify.com
 **/
export async function isAmplienceConnected(params: { shop: string }) {
    try{
        const dbRes = await fetch(`/api/shop-session?shop=${params.shop}`)
        const tableItems = await dbRes.json()
        //@ts-ignore
        const connectionStatus = tableItems.amplience_connection
        return connectionStatus === undefined
            ? updateAmplienceConnect({ shop: params.shop, status: false })
            : connectionStatus === 'true' ? true : false
    } catch (err : any) {
        console.error(err)
    }

}

/**
 * Query DynamoDB Global Secondary Index (GSI) for Amplience connection alongside Shop GSI.
 * If Shop exists, and app is installed, set connection to true.
 * @param {string} shop
 * @param {boolean}
 **/
export async function updateAmplienceConnect(params: {
    shop: string
    status: boolean
}) {
    try {
        await fetch(
            `/api/update-amplience-connect?shop=${params.shop}&status=${params.status}`
        )
    } catch (error) {
        console.error(error)
    }
}
