const fs = require('fs-extra')
const path = require('path')

const { NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN, GITHUB_WORKSPACE } = process.env

/*
 *
 * Creates a Netlify config file so
 * the Netlify CLI may be used for
 *  automated deployments
 */
const netlifyConfig = () => {
    const config = {
        cliId: NETLIFY_SITE_ID,
        telemetryDisabled: true,
        users: {
            undefined: {
                auth: {
                    github: {
                        provider: 'github',
                        token: NETLIFY_AUTH_TOKEN,
                    },
                },
            },
        },
    }
    const data = JSON.stringify(config, null, 2)

    fs.writeFileSync(
        path.join(GITHUB_WORKSPACE, '/.config/netlify/config.json'),
        data,
        (error) => {
            if (error) {
                throw error
            }

            // eslint-disable-next-line no-console
            console.log('Config file created!')
        }
    )
}

module.exports = netlifyConfig()