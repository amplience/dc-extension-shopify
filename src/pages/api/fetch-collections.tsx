import { nodesFromEdges } from "@shopify/admin-graphql-api-utilities";
import Shopify, { RequestReturn } from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";
import initMiddleware from '../../lib/init-middleware';
const Cors = require("cors");

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET and OPTIONS
        methods: ['GET', 'OPTIONS'],
    })
)

interface CollectionQuery extends RequestReturn {
    body: {
        data: {
            collections: any
        }
    }
}

/**
 * Cors-enabled endpoint that fetches products belonging to a specified
 * Shopify Collection.
 * 
 * NOTE: Some form of auth is recommended here - has not been implemented
 * because this endpoint is not currently being used anywhere
 * 
 * NOTE: Bottleneck w/ stores >250 collections needs to be adressed if this
 * endpoint is to be used. Query is not specific.
 *
 * @export
 * @async
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {*}
 */
export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    await cors(req, res);

    try {
        if(req.method === 'GET') {
            if (!req.query.shop || !req.query.key) {
                throw new Error("invalid request body")
            }

            const shopify = new Shopify.Clients.Graphql(req.query.shop as string, req.query.key as string);
            const { body: { data: { collections: { edges: collectionEdges } } } } = await shopify.query({
                data: `{
                    collections (first: 250 sortKey:UPDATED_AT) {
                        edges {
                            cursor
                            node {
                                id
                                title
                                productsCount
                            }
                        }
                    }
                }`
            }) as CollectionQuery

            const collectionResults = nodesFromEdges(collectionEdges);
            
            res.status(200).json({collections: collectionResults});
    
        } else {
            throw new Error("invalid request method")
        }    
    } catch (error:any) {
        res.status(400).json({ error: error.message})
    }
    
}