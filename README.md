# Amplience Shopify Connector

Embedded Shopify app made with Node, [Next.js](https://nextjs.org/), [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), [App Bridge React](https://shopify.dev/tools/app-bridge/react-components), and DynamoDB.

## Requirements

- Docker
- Node.js + npm
- ngrok account
- [shopify-cli](https://github.com/Shopify/shopify-app-cli) installed
- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app).

## Usage

### Installation

```
> yarn install
```

### Setting up DynamoDB

In order for the app to function, the DynamoDB instance must be runnig.

Once you have Docker installed, you can run the following command to standup both the local Dynamo instance itself, and a GUI admin panel running at `localhost:8001`

```
yarn docker:db
```

### Running the app

Running the app itself involves using the standard app commands from the [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli).

First, login to the cli

```
shopify login
```

Connect the cli to your app and development store you'll be installing the app to

```
shopify app connect
```

Configure the cli to use your ngrok account by passing in your auth token (you can grab this from your ngrok account dashboard)

```
shopify app tunnel auth <authToken>
```

Start the tunnel and copy the URL

```
shopify app tunnel start
```

Now you should be able to install and run your app in your development store by running the serve command and navigating to the install link printed in your terminal

```
shopify app serve
```
