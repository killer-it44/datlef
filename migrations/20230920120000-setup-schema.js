'use strict'

const queries = require('./queries/queries')

const [user, pw] = process.env.READONLY_DB_USER.split(':')

exports.up = async function (db) {
    const result = await db.runSql(`SELECT * FROM pg_catalog.pg_tables WHERE schemaname='datlef' AND tablename='queries'`)
    if (result.rows.length === 0) {
        await db.runSql(`CREATE FUNCTION "last_n_days"(n int)
            returns SETOF date as $$
                select "dt"::date from generate_series(current_date - ((n -1) || ' days')::INTERVAL, current_date, interval '1 days') "dt"
            $$ language sql;`)
        await db.runSql(`CREATE USER ${user} WITH PASSWORD '${pw}'`)
        await db.runSql(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${user}`)
        await db.runSql('CREATE SCHEMA IF NOT EXISTS datlef')
        await db.runSql(`GRANT USAGE ON SCHEMA datlef TO ${user}`)
        await db.runSql(`CREATE TABLE IF NOT EXISTS "datlef"."queries" (
            "queryname" TEXT PRIMARY KEY NOT NULL CHECK (queryname <> ''),
            "owner" TEXT NOT NULL CHECK (owner <> ''),
            "sql" TEXT NOT NULL CHECK (sql <> '')
        )`)
        await db.runSql(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA datlef TO ${user}`)

        const insertSql = `INSERT INTO datlef.queries (queryname, owner, sql) VALUES ($1, $2, $3)`
        for (const q of queries) {
            await db.runSql(insertSql, [q.name, q.owner, q.sql])
        }
    }
}

exports.down = async function (db) {

    await client.query(`REVOKE ALL ON SCHEMA public FROM ${user}`)
    await client.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${user}`)
    await client.query(`REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ${user}`)
    // await client.query(`REVOKE ALL ON SCHEMA datlef FROM ${user}`)
    // await client.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA datlef FROM ${user}`)
    // await client.query(`REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA datlef FROM ${user}`)
    await client.query(`DROP USER ${user}`)

    await client.query(`DROP SCHEMA datlef CASCADE`)
    await db.runSql('DROP FUNCTION "last_n_days"')
}
