import App from './app.js'
import cfenv from 'cfenv'
import migrate from './migrate.js'

await migrate('up')

const dbCreds = cfenv.getAppEnv().getServiceCreds('postgres-usage-tracker')
const aiCreds = cfenv.getAppEnv().getServiceCreds('test-llm')
const ssl = dbCreds.sslcert ? { cert: dbCreds.sslcert, ca: dbCreds.sslrootcert } : undefined

// START APP WITH READONLY DB USER
const connectionString = dbCreds.uri.replace(/:\/\/.*:.*@/u, `://${process.env.READONLY_DB_USER}@`)
new App().run({ httpServerPort: process.env.PORT, db: { connectionString, ssl }, ai: aiCreds })
