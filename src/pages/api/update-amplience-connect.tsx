import DynamoClient from '../../database/dynamo-client'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { NextApiRequest, NextApiResponse } from 'next'

const db = new DynamoClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!req.query.shop) {
        throw new Error("invalid request body")
    }

    try {
        const data = await db.getShopItems({ shop: req.query.shop })
        const updateParams = {
            TableName: db.TABLE_NAME,
            Key: {
                //@ts-ignore
                id: data.id,
            },
            UpdateExpression: 'set #amplience_connection = :amplience_connection',
            ExpressionAttributeNames: {
                '#amplience_connection': 'amplience_connection',
            },
            ExpressionAttributeValues: {
                ':amplience_connection': `${req.query.status}`,
            },
        }

        const mutation = await db.ddbDocClient.send(new UpdateCommand(updateParams))
        res.status(200).json(mutation === undefined ? {} : mutation)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Error getting shop info => ${error}` })
    }
}