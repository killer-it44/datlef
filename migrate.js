import cfenv from 'cfenv'
import DBMigrate from 'db-migrate'

const dbCreds = cfenv.getAppEnv().getServiceCreds('postgres-usage-tracker')
const ssl = dbCreds.sslcert ? { cert: dbCreds.sslcert, ca: dbCreds.sslrootcert } : undefined

const migrate = DBMigrate.getInstance(true, {
    env: 'default',
    config: { default: { driver: 'pg', connectionString: dbCreds.uri, ssl } }
})

export default async function (operation) {
    await migrate[operation]()
}
