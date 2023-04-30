import fs from 'fs/promises'
import pg from 'pg'

const data = JSON.parse(await fs.readFile('db/test-data.json'))
const sql = 'INSERT INTO analytics ("sourceUri", "targetUri", "userId", "timestamp") VALUES ($1, $2, $3, $4);'
const client = new pg.Client('postgres://postgres@localhost/postgres')
await client.connect()
await client.query((await fs.readFile('db/create-test-table.sql')).toString())
await client.query((await fs.readFile('db/create-last-n-days-function.sql')).toString())

await client.query('BEGIN')

try {
    data.forEach(async record => {
        await client.query(sql, [record.sourceUri, record.targetUri, record.userId, record.timestamp])
    })
    await client.query('COMMIT')
} catch (error) {
    await client.query('ROLLBACK')
    throw error
} finally {
    await client.end()
}
