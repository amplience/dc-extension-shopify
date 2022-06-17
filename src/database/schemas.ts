class TableSchema {
  shopTable: any
  constructor(tableName: string | undefined) {
    this.shopTable = {
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S"
        },
        {
          AttributeName: "shop",
          AttributeType: "S"
        },
        {
          AttributeName: "amplience_connection",
          AttributeType: "S"
        }
      ],
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 3,
        WriteCapacityUnits: 3
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: "shopIndex",
          KeySchema: [
            {
              AttributeName: "shop",
              KeyType: "HASH"
            }
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3
          },
        },
        {
          IndexName: "AmplienceIndex",
          KeySchema: [
            {
              AttributeName: "amplience_connection",
              KeyType: "HASH"
            }
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3
          },
        },
      ]
    }
  }
}

export default TableSchema