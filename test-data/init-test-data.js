import fs from 'fs/promises'
import pg from 'pg'
import * as csv from 'csv'

const parse = (csvString) => new Promise((resolve, reject) => {
    csv.parse(csvString, { from_line: 2 }, (err, records) => err ? reject(err) : resolve(records))
})

const insertAll = async (sql, records) => {
    for (const record of records) {
        await client.query(sql, record)
    }
}

const client = new pg.Client('postgres://postgres@localhost/postgres')
await client.connect()

await client.query('DROP TABLE IF EXISTS user_table')
await client.query((await fs.readFile('test-data/user_table.sql')).toString())
const insertUserSql = 'INSERT INTO user_table (id, uuid) VALUES ($1, $2);'
const users = await parse(await fs.readFile('test-data/user_table.csv'))

await client.query('DROP TABLE IF EXISTS page')
await client.query((await fs.readFile('test-data/page.sql')).toString())
const insertPageSql = 'INSERT INTO page (id, group_name, site_name) VALUES ($1, $2, $3);'
const pages = await parse(await fs.readFile('test-data/page.csv'))

await client.query('DROP TABLE IF EXISTS pagehit')
await client.query((await fs.readFile('test-data/pagehit.sql')).toString())
const insertPagehitSql = 'INSERT INTO pagehit (id, page_id, user_id, instant) VALUES ($1, $2, $3, $4);'
const pageHits = await parse(await fs.readFile('test-data/pagehit.csv'))

await client.query('DROP TABLE IF EXISTS click')
await client.query((await fs.readFile('test-data/click.sql')).toString())
const insertClickSql = 'INSERT INTO click (id, source_uri, target_uri, user_id, instant) VALUES ($1, $2, $3, $4, $5);'
const clicks = await parse(await fs.readFile('test-data/click.csv'))

try {
    await insertAll(insertUserSql, users)
    await insertAll(insertPageSql, pages)
    await insertAll(insertPagehitSql, pageHits)
    await insertAll(insertClickSql, clicks)
} finally {
    client.end()
}
