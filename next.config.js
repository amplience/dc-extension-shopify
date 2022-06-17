const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')

const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY)
const host = JSON.stringify(process.env.HOST)

module.exports = {
    distDir: 'dist/.next',
    plugins: [
        new Dotenv()
    ],
    webpack: (config) => {
        const env = {
            API_KEY: apiKey,
            HOST_URL: host,
        }
        config.plugins.push(new webpack.DefinePlugin(env))
        config.resolve.fallback = {
            ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
              // by next.js will be dropped. Doesn't make much sense, but how it is
            fs: false, // the solution
          };
        // Add ESM support for .mjs files in webpack 4
        config.module.rules.push({
            test: /\.tsx$/,
            include: /node_modules/,
            type: 'javascript/auto',
        })

        return config
    },
}
