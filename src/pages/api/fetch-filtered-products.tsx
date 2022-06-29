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

interface FilteredProductsQuery extends RequestReturn {
    body: {
        data: {
            products: any
        }

        errors: any
    }
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
            if (!req.query.shop || !req.query.key || req.query.hub?.length !== 24) {
                throw new Error("invalid request body")
            }

            const shopify = new Shopify.Clients.Graphql(req.query.shop as string, req.query.key as string);
            const { body } = await shopify.query({
                data: req.query.query as string
            }) as FilteredProductsQuery

            // The below should be triggered with undefined/deprecated GraphQL properties
            if(body?.errors !== undefined) {
                console.log(`invalid GraphQL request: ${JSON.stringify(body.errors)}`)
                throw("invalid request")
            }

            const nodes:any[] = nodesFromEdges(body.data.products.edges)
            body.data.products.edges.forEach((edge:any, index:number) => {
                if(edge.cursor) {
                    nodes[index].cursor = edge.cursor
                }
            })

            const responseData = {
                products: nodes,
                hasNextPage: body.data.products?.pageInfo?.hasNextPage ? body.data.products.pageInfo.hasNextPage : false
            }

            res.status(200).json(responseData);
    
        } else {
            throw new Error("invalid request method")
        }    
    } catch (error:any) {
        res.status(400).json({ error: error.message})
    }
    
}