import Joi from 'joi'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const environmentSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').optional(),
    PORT: Joi.number().default(8080),
    SHOPIFY_API_KEY: Joi.string().required(),
    SHOPIFY_API_SECRET: Joi.string().required(),
    HOST: Joi.string().replace(/https:\/\/|\/$/g, '').required(),
    SCOPES: Joi.string().required(),
    DYNAMODB_TABLE: Joi.string().required(),
    LOCAL_DB: Joi.boolean().optional(),
  })
  .unknown()

  const { value: envVars, error } = environmentSchema.prefs({ errors: { label: 'key' } }).validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

// eslint-disable-next-line import/no-anonymous-default-export
export default  {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  shop_key: envVars.SHOPIFY_API_KEY,
  shop_secret: envVars.SHOPIFY_API_SECRET,
  host: envVars.HOST,
  scopes: envVars.SCOPES,
  db_table: envVars.DYNAMODB_TABLE,
  local_db: envVars.LOCAL_DB,
}
