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
await client.query(`REVOKE ALL ON SCHEMA datlef FROM ${user}`)
await client.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA datlef FROM ${user}`)
await client.query(`REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA datlef FROM ${user}`)
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
    "queryname" TEXT PRIMARY KEY NOT NULL CHECK (queryname <> ''),
    "owner" TEXT NOT NULL CHECK (owner <> ''),
    "sql" TEXT NOT NULL CHECK (sql <> '')
)`)

await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA datlef TO ${user}`)
await client.query(`GRANT USAGE ON SCHEMA datlef TO ${user}`)

const queries = [
    {
        'name': 'total page views per group',
        'sql': `SELECT
    p.group_name as page,
    count(*) AS views
FROM pagehit JOIN page p ON page_id = p.id
    GROUP BY page`
    },
    {
        'name': 'page viewers per group',
        'sql': `SELECT
    p.group_name as page,
    count(distinct user_id) AS views
FROM pagehit JOIN page p ON page_id = p.id
    GROUP BY page`
    },
    {
        'name': 'clicks by target page',
        'sql': `SELECT
    target_uri AS page,
    count(*) AS clicks
FROM click
    GROUP BY page`
    },
    {
        'name': 'total clicks per week',
        'sql': `SELECT
    concat(
        date_part('year', instant::date),
        date_part('week', instant::date)
    ) AS week,
    count(*) AS clicks
FROM click
    GROUP BY week
    ORDER BY week`
    },
    {
        'name': 'unique clicks per week',
        'sql': `SELECT
    concat(
        date_part('year', instant::date),
        date_part('week', instant::date)
    ) AS week,
    count(DISTINCT user_id) AS clicks
FROM click
    GROUP BY week
    ORDER BY week`
    },
    {
        'name': 'clicks per day, last 7',
        'sql': `SELECT date, sum(clicks) AS clicks FROM (
    SELECT
        instant::date AS date,
        count(*) AS clicks
    FROM click
    WHERE instant > current_date - interval '7' day
    GROUP BY date
UNION
    SELECT dt::date AS date, 0 AS clicks FROM last_n_days(7) dt
) a GROUP BY a.date ORDER BY a.date ASC`
    }
]

let promiseChain = Promise.resolve()
queries.forEach(q => {
    promiseChain = promiseChain.then(() => {
        return client.query(
            `INSERT INTO datlef.queries (queryname, owner, sql) VALUES ($1, 'default', $2)`,
            [q.name, q.sql]
        )
    })
})

await promiseChain

await client.end()
