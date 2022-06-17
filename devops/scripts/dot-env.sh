#!/bin/bash
touch $PWD/.env
cat > $PWD/.env << EOL
SHOPIFY_API_KEY=$SHOPIFY_API_KEY
SHOPIFY_API_SECRET=SHOPIFY_API_SECRET
SHOP=$SHOP
SCOPES=$SCOPES
HOST=$HOST
DYNAMODB_TABLE=$DYNAMODB_TABLE
REGION=$REGION
LOCAL_DB=$LOCAL_DB
EOL