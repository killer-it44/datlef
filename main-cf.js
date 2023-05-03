import App from './app.js'
import cfenv from 'cfenv'
import pg from 'pg'

const dbCreds = cfenv.getAppEnv().getServiceCreds('postgres-usage-tracker')
const ssl = { cert: dbCreds.sslcert, ca: dbCreds.sslrootcert }

// CREATE READONLY DB USER IF NOT EXISTING
const client = new pg.Client({ connectionString: dbCreds.uri, ssl })
await client.connect()
const [user, pw] = process.env.READONLY_DB_URL.match('://(.*?)@')[1].split(':')

// try {
    // console.log('checking if readonly user already exists')
    const selectUserResp = await client.query(`SELECT usename FROM pg_catalog.pg_user WHERE usename = $1`, [user])
    console.log(JSON.stringify(selectUserResp.rows))
    if (selectUserResp.rows.length === 0) {
        // console.log('test select')
        // const resp = await client.query(`SELECT * FROM clicks LIMIT 1`)
        // console.log(JSON.stringify(resp.rows))

        console.log(`${user}:${pw}`)
        await client.query(`CREATE USER ${user} WITH PASSWORD '${pw}'`)
        console.log('created user')
        await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${user}`)
        console.log('granted select permissions')
    }

    await client.query('DROP FUNCTION IF EXISTS "last_n_days"')
    await client.query(`CREATE FUNCTION "last_n_days"(n int)
        returns SETOF date as $$
            select "dt"::date from generate_series(current_date - ((n -1) || ' days')::INTERVAL, current_date, interval '1 days') "dt"
        $$ language sql;`)
    await client.end()

    // START APP WITH READONLY DB USER
    new App().run({ httpServerPort: process.env.PORT, db: { connectionString: process.env.READONLY_DB_URL, ssl } })
// } catch (error) {
//     console.error(error)
//     process.exit(1)
// }

