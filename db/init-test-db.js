import fs from 'fs/promises'
import pg from 'pg'

const data = JSON.parse(await fs.readFile('db/test-data.json'))
const sql = 'INSERT INTO click ("id", "source_uri", "target_uri",  "user_id", "instant") VALUES ($1, $2, $3, $4, $5);'
const client = new pg.Client('postgres://postgres@localhost/postgres')
await client.connect()
await client.query((await fs.readFile('db/create-test-table.sql')).toString())
await client.query((await fs.readFile('db/create-last-n-days-function.sql')).toString())

await client.query('BEGIN')

try {
    data.forEach(async record => {
        await client.query(sql, [record.id, record.source_uri, record.target_uri, record.user_id, record.instant])
    })
    await client.query('COMMIT')
} catch (error) {
    await client.query('ROLLBACK')
    throw error
} finally {
    await client.end()
}
