import App from './app.js'
import cfenv from 'cfenv'

const dbCreds = cfenv.getAppEnv().getServiceCreds('postgres-usage-tracker')
const ssl = { cert: dbCreds.sslcert, ca: dbCreds.sslrootcert }

// START APP WITH READONLY DB USER
new App().run({ httpServerPort: process.env.PORT, db: { connectionString: process.env.READONLY_DB_URL, ssl } })
