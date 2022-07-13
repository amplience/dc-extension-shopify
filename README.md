# Amplience Shopify Connector

## Shopify app made with
- Node
- [Next.js](https://nextjs.org/)
- [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth)
- [Polaris](https://github.com/Shopify/polaris-react)
- [App Bridge React](https://shopify.dev/tools/app-bridge/react-components)
- DynamoDB

## Requirements

- [AWS CLI](https://aws.amazon.com/cli/)
- Ruby `v2.6.8` ~ `v3.0.0`
- Docker
- Node `v16.15.0`
- Yarn
- [ngrok](https://ngrok.com/) account & [Auth Token](https://ngrok.com/docs/secure-tunnels#tunnel-authtokens)
- [shopify-cli](https://github.com/Shopify/shopify-app-cli) `v2.12.0`

### Note
1. If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup)
1. If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app
1. In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app)


## Contents

* [Setup](#header-setup)
  - [CLI](#header-cli)
* [Connecting to DynamoDB on AWS locally](#header-dynamodb-in-aws)
* [Hosting](#header-hosting)

## CLI

To use the aws [dyanmodb client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/index.html), we have to install and configure the [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html). Use the following as guides:

- [Quick configuration with aws configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config)
- [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

## Setup (macOS)

Install Shop CLI version `2.12.0`


```bash
curl -o shopify-cli.zip https://codeload.github.com/Shopify/shopify-cli/zip/refs/tags/v2.12.0 && \
    unzip shopify-cli.zip && rm -rf shopify-cli.zip
```

Create and copy CLI source directory

```bash
mkdir ~/.shopify-cli-2.12.0 && cp -r shopify-cli-2.12.0/* ~/.shopify-cli-2.12.0
```

Symlink shop CLI binaries
```bash
sudo ln -s ~/.shopify-cli-2.12.0/bin/shopify /usr/local/bin/shopify
```

Invoke a new shell
```bash
exec $SHELL
```

Verify install
```bash
shopify version
```

You should see something like the following:
```bash
You are running a development version of the CLI at:
  /Users/local/.shopify-cli-2.12.0/bin/shopify

2.12.0
```
Cleanup CLI files
```bash
rm -rf shopify-cli-2.12.0
```

## Usage

### Install dependencies

```bash
yarn install
```

### DynamoDB

In order for the app to function, the DynamoDB instance must be runnig.
Once you have Docker installed, you can run the following command to standup both the local Dynamo instance itself, and a GUI admin panel running at `localhost:8001`

```
yarn docker:db
```

You should see the following:
```bash
Attaching to dynamo-admin, shopify-dynamodb
mazemail-dynamodb  | Initializing DynamoDB Local with the following configuration:
mazemail-dynamodb  | Port:	8000
mazemail-dynamodb  | InMemory:	false
mazemail-dynamodb  | DbPath:	null
mazemail-dynamodb  | SharedDb:	true
mazemail-dynamodb  | shouldDelayTransientStatuses:	false
mazemail-dynamodb  | CorsParams:	*
mazemail-dynamodb  |
dynamo-admin       |   database endpoint: 	http://dynamodb-local:8000
dynamo-admin       |   region: 		us-east-1
dynamo-admin       |   accessKey: 		local
dynamo-admin       |
dynamo-admin       |   dynamodb-admin listening on http://:::8001 (alternatively http://0.0.0.0:8001)
```

### Running the app

Running the app itself involves using the standard app commands from the [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli).

Log into the Admin

```bash
shopify login
```

Connect the CLI to your app and development store you'll be installing the app to

```bash
shopify app connect
```

Configure the CLI to use your ngrok account by passing in your auth token (you can grab this from your ngrok account dashboard)

```bash
shopify app tunnel auth <authToken>
```

Start the tunnel and copy the URL

```bash
shopify app tunnel start
```

Now you should be able to install and run your app in your development store by running the serve command and navigating to the install link printed in your terminal

```
shopify app serve
```

Finally, you can start testing the app using the install link provided by the CLI. For example:
```bash
https://<DOMAIN>.ngrok.io/auth?shop=<YOUR_SHOP_NAME>.myshopify.com
```

### Hosting

**You can find hosting instructions [here](docs/1_Hosting.md)**

### DynamoDB in AWS

If you'd like to test the connection between AWS (Dynamodb) and your local dev environment you need to

1. Start the server process using `yarn local:start`
1. Start an ngrok tunnel `ngrok http 8080`

You will need to create the install URL using your ngrok domain and install param that contains you shop name

```bash
https://<DOMAIN>.ngrok.io/auth?shop=<YOUR_SHOP_NAME>.myshopify.com
```