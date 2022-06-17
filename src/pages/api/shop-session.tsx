import DynamoClient from '../../database/dynamo-client'
import type { NextApiRequest, NextApiResponse } from 'next'

const db = new DynamoClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!req.query.shop) {
        throw new Error('invalid request body')
    }

    try {
        const data = await db.getShopItems({ shop: req.query.shop })
        res.status(200).json(data === undefined ? {} : data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Error getting shop info => ${error}` })
    }
}