import pg from 'pg'
import cfenv from 'cfenv'

const dbCreds = cfenv.getAppEnv().getServiceCreds('postgres-usage-tracker')
const ssl = { cert: dbCreds.sslcert, ca: dbCreds.sslrootcert }

const client = new pg.Client({ connectionString: dbCreds.uri, ssl })
await client.connect()
const [user, pw] = process.env.READONLY_DB_URL.match('://(.*?)@')[1].split(':')

await client.query(`REVOKE ALL ON SCHEMA public FROM ${user}`)
await client.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${user}`)
await client.query(`REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ${user}`)
await client.query(`DROP USER ${user}`)

await client.query(`CREATE USER ${user} WITH PASSWORD '${pw}'`)
await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${user}`)

await client.query('DROP FUNCTION IF EXISTS "last_n_days"')
await client.query(`CREATE FUNCTION "last_n_days"(n int)
    returns SETOF date as $$
        select "dt"::date from generate_series(current_date - ((n -1) || ' days')::INTERVAL, current_date, interval '1 days') "dt"
    $$ language sql;`)

await client.query('CREATE SCHEMA IF NOT EXISTS datlef')
await client.query(`CREATE TABLE IF NOT EXISTS "datlef"."queries" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL
)`)

await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA datlef TO ${user}`)
await client.query(`GRANT USAGE ON SCHEMA datlef TO ${user}`)

await client.end()
