
import type { NextApiRequest, NextApiResponse } from 'next'
import DynamoClient from 'src/database/dynamo-client';

const db = new DynamoClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    try {
        const data = await db.getShopItems({ shop: req.query.shop });
        const tokenFragment = data?.accessToken.slice(data.accessToken.length - 5);
        const extensionName = `col-p-${tokenFragment}`
        res.status(200).json(
            {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "$id": `${process.env.HOST}/api/schemas/collection-picker`,
                "title": "Title",
                "description": "Description",
                "allOf": [
                    {
                        "$ref": "http://bigcontent.io/cms/schema/v1/core#/definitions/content"
                    }
                ],
                "type": "object",
                "properties": {
                    "title": {
                        "title": "Collection Name",
                        "type": "string",
                        "description": "Headline to display over the collection."
                    },
                    "showPrice":{
                        "title" : "Hide Product Price",
                        "type" : "boolean"
                    },
                    "collection": {
                        "title": "Selected collection of products to render.",
                        "type": "object",
                        "ui:extension": {
                            "name": extensionName
                        },
                        "properties": {
                            "id": {
                                "title": "Shopify Collection ID",
                                "type": "string"
                            },
                            "name": {
                                "title": "Shopify Collection Title",
                                "type": "string"
                            },
                            "maxLength": {
                                "title": "Maximum Carousel Product Count",
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 25
                            }
                        }
                    }
                },
                "propertyOrder": [
                    "title",
                    "showPrice",
                    "collection"
                ]
            }
        )
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Error getting shop info => ${error}` })
    }
}