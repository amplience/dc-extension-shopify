import type { NextApiRequest, NextApiResponse } from 'next'
import DynamoClient from 'src/database/dynamo-client';

const db = new DynamoClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    try {
        const data = await db.getShopItems({ shop: req.query.shop });
        console.log(data);
        const tokenFragment = data?.accessToken.slice(data.accessToken.length - 5)
        const extensionName = `prod-f-${tokenFragment}`
        res.status(200).json(
            {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "$id": `${process.env.HOST}/api/schemas/product-filter`,
            
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
                        "title": "Product Picker",
                        "type": "string",
                        "description": "Headline to display over the collection."
                    },
                    "showPrice":{
                        "title" : "Hide Product Price",
                        "type" : "boolean"
                    },
                    "product-filter": {
                        "type": "object",
                        "description": "",
                        "ui:extension": {
                            "name": extensionName
                        },
                        "properties": {
                            "queryString": {
                                "title": "Actual query used to fetch products from Shopify Storefront API",
                                "type":"string"
                            },
                            "rawConditions": {
                                "type": "array",
                                "title": "Raw conditions objects used to construct query"
                            }
                        }
                    }
                },
                "propertyOrder": [
                    "title",
                    "showPrice",
                    "product-filter"
                ]
            }
        )
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Error getting shop info => ${error}` })
    }
}