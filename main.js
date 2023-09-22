import App from './app.js'
import cfenv from 'cfenv'
import DBMigrate from 'db-migrate'

const dbCreds = cfenv.getAppEnv().getServiceCreds('postgres-usage-tracker')
const ssl = dbCreds.sslcert ? { cert: dbCreds.sslcert, ca: dbCreds.sslrootcert } : undefined

const migrate = DBMigrate.getInstance(true, {
    env: 'default',
    config: { default: { driver: 'pg', connectionString: dbCreds.uri, ssl } }
})
await migrate.up()

// START APP WITH READONLY DB USER
const connectionString = dbCreds.uri.replace(/:\/\/.*:.*@/u, '://process.env.READONLY_DB_USER@')
new App().run({ httpServerPort: process.env.PORT, db: { connectionString, ssl } })
