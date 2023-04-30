import fs from 'fs'
import JSONStream from 'JSONStream'
import pg from 'pg'
import { Writable } from 'stream'

class InsertStream extends Writable {
    #sql = 'INSERT INTO analytics ("sourceUri", "targetUri", "userId", "instant") VALUES ($1, $2, $3, $4);'
    #client = null
    constructor(client) {
        super({ objectMode: true })
        this.#client = client
    }
    _write(data, _encoding, callback) {
        this.#client.query(this.#sql, [data.sourceUri, data.targetUri, data.userId, data.instant], callback)
    }
}

const client = new pg.Client('postgres://postgres@localhost/postgres')
await client.connect()
await client.query('BEGIN')
let error = null

fs.createReadStream('db/test-data.json')
    .pipe(JSONStream.parse('*'))
    .pipe(new InsertStream(client))
    .on('error', err => error = err)
    .on('close', async () => {
        if (error) {
            await client.query('ROLLBACK')
            throw error
        } else {
            await client.query('COMMIT')
        }
        await client.end()
    })
