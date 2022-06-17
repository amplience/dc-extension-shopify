import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb'

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

import { v4 as uuidv4 } from 'uuid'
import TableSchema from './schemas'
import { info, success, error } from '../utils/logger'

/** Class representing DynamoDBClient and DynamoDBDocumentClient. */
class DynamoClient {
  ddbClient: DynamoDBClient
  ddbDocClient: DynamoDBDocumentClient
  config: { endpoint?: string, accessKeyId?: string, secretAccessKey?: string, region?: string }
  TABLE_NAME: string | undefined
  shopTable: any
  constructor() {
    const accessVars = process.env.MY_AWS_ACCESS_KEY_ID && process.env.MY_AWS_SECRET_ACCESS_KEY !== undefined
    // @ts-ignore
    const localDB = process.env.LOCAL_DB === true || process.env.NODE_ENV === 'development'
    const marshallOptions = {
      // Convert typeof object to map attribute.
      convertClassInstanceToMap: true,
      // Remove undefined values while marshalling.
      removeUndefinedValues: true
    }
    this.TABLE_NAME = process.env.DYNAMODB_TABLE
    this.shopTable = new TableSchema(this.TABLE_NAME).shopTable
    // Configuration for DynamoDB.
    this.config = {
      ...(localDB && {
        endpoint: 'http://localhost:8000',
        region: process.env.REGION
      }) || accessVars && {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
        region: process.env.REGION
      }
    }
    this.ddbClient = new DynamoDBClient(this.config)
    // Create the DynamoDB Document client.
    this.ddbDocClient = DynamoDBDocumentClient.from(this.ddbClient, { marshallOptions })
  }

  /** https://github.com/Shopify/shopify-node-api/blob/main/docs/usage/customsessions.md#create-a-customsessionstorage-solution */
  async storeShopSession(session: any) {
    const tableParams = { TableName: this.TABLE_NAME }
    // DynamoDB cannot marshall instance of Date. Convert to String
    const expires = session.expires instanceof Date ? session.expires.toString() : false

    const saveSessionCommand = {
      ...tableParams,
      Item: {
        ...session,
        ...(session.expires && { expires }),
      },
    }

    let count = 0
    try {
      await this.ddbDocClient.send(new DescribeTableCommand(tableParams))
      console.log(info("SHOP_TABLE_EXISTS"))
      const shopItems = await this.getShopItems(session.shop)
      if (shopItems === undefined) {
        await this.ddbDocClient.send(new PutCommand(saveSessionCommand))
      }
      return true
    } catch (err) {

      try {
        console.log(info("CREATING_TABLE"), this.TABLE_NAME)
        await this.ddbDocClient.send(new CreateTableCommand(this.shopTable))
        while (count < 200) {
          await new Promise(resolve => setTimeout(resolve, count++))
          if (count >= 200) {
            break
          }
        }
      } catch (error) {
        console.log(error)
      }

      try {
        await this.ddbDocClient.send(new PutCommand(saveSessionCommand))
        console.log(success(`${session.shop}_SESSION_STORED`))
        return true
      } catch (err) {
        console.log(error('SHOP_SESSION_ERROR'), err)
        return false
      }
    }
  }

  async loadShopSession(session: any) {
    let count = 0
    console.log(info("LOADING_SESSION_ID"), session)

    while (count < 150) {
      await new Promise(resolve => setTimeout(resolve, count++))
      if (count >= 150) {
        break
      }
    }
    const params = {
      TableName: this.TABLE_NAME,
      Key: {
        id: session,
      }
    }
    const command = new GetCommand(params)

    try {
      let data = await this.ddbDocClient.send(command)
      console.log(success("SHOP_SESSION_LOADED"))
      if (data) {
        return data.Item
      } else {
        return undefined
      }
    } catch (error) {
      console.error(error)
    }
  }

  async deleteShopSession(session: any) {
    const command = new DeleteCommand({
      TableName: this.TABLE_NAME,
      Key: {
        id: session
      }
    })

    try {
      const data = await this.ddbDocClient.send(command)
      console.log(success("SHOP_UNREGISTER"), data)
      return true
    } catch (err) {
      console.log(error("SHOP_UNREGISTER_ERROR"), err)
      return false
    }
  }

  // https://github.com/Shopify/shopify-node-api/blob/main/docs/usage/webhooks.md
  async uninstallShop(shop: string) {
    const params = {
      shop: shop
    }
    const shopItems = await this.getShopItems(params)
    const command = new DeleteCommand({
      TableName: this.TABLE_NAME,
      Key: {
        //@ts-ignore
        id: shopItems.id
      }
    })

    try {
      const data = await this.ddbDocClient.send(command)
      console.log(success("SHOP_UNINSTALLED"), shop, data)
      return data
    } catch (err) {
      console.log(error("SHOP_UNINSTALL_ERROR"), err)
      return error
    }
  }

  // Custom function to query the table using a Global Secondary Index (Shop)
  async getShopItems(params: any) {
    const queryParams = {
      TableName: this.TABLE_NAME,
      IndexName: 'shopIndex',
      KeyConditionExpression: 'shop = :s',
      ExpressionAttributeValues: {
        ':s': `${params.shop}`,
      },
    }

    try {
      const data = await this.ddbDocClient.send(new QueryCommand(queryParams))
      //@ts-ignore
      return data.Items[0]
    } catch(error) {
      console.log(error)
    }
  }

}

export default DynamoClient
