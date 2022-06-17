import { nodesFromEdges } from "@shopify/admin-graphql-api-utilities";
import Shopify, { RequestReturn } from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";
import initMiddleware from '../../lib/init-middleware';
const Cors = require("cors");

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET and OPTIONS
        methods: ['GET']
    })
)

interface CollectionProductsQuery extends RequestReturn {
    body: {
        data: {
            collection: {
                products: any
            }
        }

        errors: any
    }
}

/**
 * Generates GraphQL query string by taking collection ID
 * 
 * NOTE: featuedImage props src and transformedSrc are DEPRECATED
 * This will result in continued deprecation notices in console log
 * @param {string} id
 * @returns {string}
 */
function formatQuery(id:string) {
    return `{
        collection(id:"${id}") {
            products(first: 25) {
                edges {
                    node {
                        id
                        title
                        status
                        vendor
                        priceRangeV2 {
                            maxVariantPrice {
                                amount
                                currencyCode
                            }
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                        featuredImage {
                            src
                            altText
                            transformedSrc(maxHeight: 100 preferredContentType:JPG)
                        }
                    }
                }
            }
        }
    }`
}

/**
 * Cors-enabled endpoint w/ 'soft' auth that fetches products belonging
 * to a specified Shopify Collection.
 * 
 * NOTE: req.query.hub is intended to be a 'soft' method of authentication
 * during development. This should probably be replaced.
 * 
 * @export
 * @async
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {*}
 */
export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    // Enable cors
    await cors(req, res);

    try {
        if(req.method === 'GET') {
            if (!req.query.shop || !req.query.key || !req.query.collection || req.query.hub.length !== 24) {
                throw new Error("invalid request body")
            }

            const shopify = new Shopify.Clients.Graphql(req.query.shop as string, req.query.key as string);
            const { body } = await shopify.query({
                data: formatQuery(req.query.collection as string)
            }) as CollectionProductsQuery

            // The below should be triggered with undefined/deprecated GraphQL properties
            if(body?.errors !== undefined) {
                console.log(`invalid GraphQL request: ${JSON.stringify(body.errors)}`)
                throw("invalid request")
            }

            res.status(200).json({products: nodesFromEdges(body.data.collection.products.edges)});
    
        } else {
            throw new Error("invalid request method")
        }    
    } catch (error:any) {
        res.status(400).json({ error: error.message})
    }
    
}